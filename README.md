# తెలుగు మాస్ — Clone

Vanilla HTML/CSS/JS jukebox site tho Supabase backend (realtime listener count + song catalogue).

## Setup Steps

### 1. Supabase project create cheyyi
- https://supabase.com → New Project
- Project Settings → API → `Project URL` and `anon public` key copy cheyyi
- `config.js` lo `SUPABASE_URL` and `SUPABASE_ANON_KEY` paste cheyyi

### 2. Database table create cheyyi
- Supabase Dashboard → SQL Editor → `supabase-setup.sql` content run cheyyi
- Idi `songs` table create chesi public read access istundi

### 3. Realtime enable cheyyi
- Supabase Dashboard → Database → Replication → Realtime → **enabled** undaali (default ga on untundi, presence needs no extra setup — it uses Supabase's built-in Realtime channels)

### 4. Nee songs upload cheyyi
Two options:

**Option A — Supabase Storage (recommended):**
- Dashboard → Storage → New bucket → name it `audio` → make it **public**
- Songs (mp3) upload cheyyi ikkada
- Each file ki "Get URL" nunchi public URL copy cheyyi

**Option B — Local files:**
- `assets/audio/` folder lo mp3 files pettu
- `song-catalogue.json` lo paths update cheyyi (fallback data ga use avthundi if Supabase table empty)

### 5. Songs table lo rows add cheyyi
Table Editor → `songs` → Insert row:
| title | artist | category | audio_url | sort_order |
|---|---|---|---|---|
| Basinga Balaalu | Singer | tractor | https://...supabase.co/storage/.../tractor-1.mp3 | 1 |

`category` **must** be one of: `tractor`, `gym`, `90s`, `bob`, `ride`

### 6. Background images add cheyyi
`assets/images/` lo ee files pettu (original site lo unna names):
- `tractor-telangana.png`
- `gym-hyderabad.png`
- `90s-hyderabad.png`
- `bob.jpeg`
- `ride-blue-hour.png`

(nee own images / AI generated art use cheyyachu — same names tho save cheste code marchakarleda)

### 7. Font add cheyyi (optional)
`assets/fonts/potti-sreeramulu-regular.otf` — original site "Potti Sreeramulu" font use chesindi (Telugu display font). Nee daggara lekapothe, fallback ga "Noto Sans Telugu" vastundi automatic ga (already CSS lo configured).

### 8. Run locally
Ee site ki backend server avasaram ledu — just any static server:
```bash
npx serve .
# or
python3 -m http.server 8000
```

### 9. Deploy to Vercel
```bash
npm i -g vercel
vercel
```
Leda GitHub repo ki push chesi Vercel dashboard lo import cheyyi (auto-deploy).

## File structure
```
telugu-mass-clone/
├── index.html          # main page structure
├── style.css            # glassmorphism + glow animation styling
├── app.js                # player logic + Supabase integration
├── config.js             # YOUR Supabase credentials go here
├── song-catalogue.json   # fallback songs (used if Supabase table empty)
├── supabase-setup.sql    # run once in Supabase SQL editor
└── assets/
    ├── audio/            # local mp3 fallback files
    ├── images/           # background images per category
    └── fonts/            # Potti Sreeramulu font
```

## Notes
- Realtime listener count = Supabase Presence channel (each open tab = 1 presence, auto updates for everyone connected)
- No login/auth needed — public read-only jukebox
- Songs insert cheyyadam Table Editor nunchi manual ga cheyyali (anon key ki insert permission ledu security kosam)
