// ---------- Supabase client ----------
let sbClient = null;
try {
  sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn("Supabase not available, running in offline mode.", e);
}

// ---------- State ----------
let currentCategory = "chill";
let songs = [];          // songs for the current category
let currentIndex = 0;
let isPlaying = false;

// ---------- DOM ----------
const stage = document.getElementById("stage");
const heading = document.getElementById("heading");
const tabs = document.querySelectorAll(".tab");
const scenes = document.querySelectorAll(".scene");

const audioEl = document.getElementById("audioEl");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const seek = document.getElementById("seek");
const timeEl = document.getElementById("time");
const nowTitle = document.getElementById("nowTitle");
const nowArtist = document.getElementById("nowArtist");

const songsBtn = document.getElementById("songsBtn");
const closeSongs = document.getElementById("closeSongs");
const songMenu = document.getElementById("songMenu");
const songListEl = document.getElementById("songList");

const listenerCountEl = document.getElementById("listenerCount");

// ---------- Category switching ----------
function setCategory(cat) {
  currentCategory = cat;
  stage.dataset.playlist = cat;
  heading.textContent = CATEGORY_LABELS[cat] || cat;

  tabs.forEach((t) => t.classList.toggle("active", t.dataset.cat === cat));
  scenes.forEach((s) => s.classList.toggle("active", s.dataset.scene === cat));

  loadSongs(cat);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setCategory(tab.dataset.cat));
});

// ---------- Fetch songs (Supabase, with local JSON fallback) ----------
async function loadSongs(cat) {
  if (sbClient) {
    try {
      const { data, error } = await sbClient
        .from("songs")
        .select("*")
        .eq("category", cat)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      songs = data && data.length ? data : await loadFallback(cat);
    } catch (e) {
      console.warn("Supabase fetch failed, using local song-catalogue.json", e);
      songs = await loadFallback(cat);
    }
  } else {
    songs = await loadFallback(cat);
  }

  currentIndex = 0;
  renderSongList();
  loadTrack(currentIndex, /* autoplay */ false);
}

async function loadFallback(cat) {
  try {
    const res = await fetch("song-catalogue.json");
    const json = await res.json();
    return json[cat] || [];
  } catch {
    return [];
  }
}

function renderSongList() {
  songListEl.innerHTML = "";
  songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = i === currentIndex ? "playing" : "";
    const artistName = (song.artist && song.artist.toLowerCase() !== "unknown") ? song.artist : "";
    li.innerHTML = `<span class="s-title">${song.title}</span><span class="s-artist">${artistName}</span>`;
    li.addEventListener("click", () => {
      loadTrack(i, true);
      songMenu.hidden = true;
    });
    songListEl.appendChild(li);
  });
}

// ---------- Player ----------
function loadTrack(index, autoplay) {
  if (!songs.length) {
    nowTitle.textContent = "No songs yet";
    nowArtist.textContent = "";
    return;
  }
  
  audioEl.pause();
  
  currentIndex = (index + songs.length) % songs.length;
  const song = songs[currentIndex];
  audioEl.src = song.audio_url;
  audioEl.load();

  nowTitle.textContent = song.title;
  nowArtist.textContent = (song.artist && song.artist.toLowerCase() !== "unknown") ? song.artist : "";
  renderSongList();

  if (autoplay) {
    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.warn("Autoplay prevented:", e);
        isPlaying = false;
        playBtn.textContent = "▶";
      });
    }
    isPlaying = true;
    playBtn.textContent = "❚❚";
  } else {
    isPlaying = false;
    playBtn.textContent = "▶";
  }
}

playBtn.addEventListener("click", () => {
  if (!audioEl.src) return;
  if (isPlaying) {
    audioEl.pause();
    playBtn.textContent = "▶";
  } else {
    audioEl.play();
    playBtn.textContent = "❚❚";
  }
  isPlaying = !isPlaying;
});

prevBtn.addEventListener("click", () => loadTrack(currentIndex - 1, true));
nextBtn.addEventListener("click", () => loadTrack(currentIndex + 1, true));
audioEl.addEventListener("ended", () => loadTrack(currentIndex + 1, true));

audioEl.addEventListener("timeupdate", () => {
  if (!audioEl.duration) return;
  seek.value = (audioEl.currentTime / audioEl.duration) * 100;
  timeEl.textContent = `${formatTime(audioEl.currentTime)} / ${formatTime(audioEl.duration)}`;
});

seek.addEventListener("input", () => {
  if (!audioEl.duration) return;
  audioEl.currentTime = (seek.value / 100) * audioEl.duration;
});

function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ---------- Song menu toggle ----------
songsBtn.addEventListener("click", () => {
  songMenu.hidden = !songMenu.hidden;
});
closeSongs.addEventListener("click", () => (songMenu.hidden = true));

// ---------- Realtime listener presence ----------
if (sbClient) {
  try {
    const listenerId = crypto.randomUUID();
    const presenceChannel = sbClient.channel("telugu-mass-room", {
      config: { presence: { key: listenerId } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const count = Object.keys(state).length;
        listenerCountEl.textContent = count || 1;
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });
  } catch (e) {
    console.warn("Presence channel failed.", e);
  }
}

// ---------- Init ----------
setCategory("chill");
