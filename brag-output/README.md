# Brag video

Made with the [/brag](https://github.com/latent-spaces/brag) skill (brag-slim workflow): the story, visuals and soundtrack are all built from this project, with no stock footage or licensed music.

| File | What |
|---|---|
| `brag.mp4` | 20 s vertical launch video, 1080×1920, 30 fps. Original music + sound effects, poster baked in as frame 0 |
| `brag.jpg` | Poster / thumbnail (the "39 games you all own" frame) |
| `share-copy.txt` | Caption, ready to paste |
| `brag-plan.md` | Angle, answers and the scene-by-scene storyboard |

Every number on screen comes from the site's labelled example group (fictional players, real games). Game covers show the app's own title tiles, so no third-party game art.

## Re-render

From the repo root, with Postgres running and a production build (`npm run build`):

```bash
STEAM_MOCK=1 STEAM_API_KEY=x SESSION_SECRET=$(openssl rand -hex 32) DATABASE_URL=… npx next start -p 3100 &
node brag-output/work/capture.mjs                  # real UI fragments from the running app
mkdir -p public/brag && cp brag-output/work/composition/* brag-output/work/fragments.json public/brag/
# restart the server so it serves public/brag, then:
node brag-output/work/frames.mjs --all             # 600 frames
node brag-output/work/soundtrack.mjs               # original track, deterministic
# encode: see the ffmpeg line in the commit that added this folder
```

`public/brag/` is gitignored; delete it after rendering.
