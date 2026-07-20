# Encoding a garden header video (`public/media/garden/*`)

Source clips are generated square (960×960, 24fps, ~5s, silent, ~6MB raw). Three things
happen at encode time; all three are deliberate.

1. **Crop to a band, don't scale the square.** `crop=960:600:0:170` keeps the sun and the
   dahlia heads and drops the top of the frame.
2. **Bake the loop crossfade into the file.** The tail is blended over the head, so a plain
   `<video loop>` loops invisibly — no stacked elements, no JS timing that can drift.
3. **H.264 only.** VP9 was measured and dropped (see below).

The current asset is **v3 (butterfly removed)**. History: v2 had a butterfly whose repeating
flight path gave away the loop; the band crop happened to hide it (it exited through the top
strip the crop drops). Halli asked for it gone, so v3 is pure wind-and-light motion. With
nothing tracking a path there is no motion cue to expose the seam, so the seam MUST be checked
numerically after every encode (see below) rather than relying on any crop trick. The
crossfade was lengthened to **0.8s** for v3 (v2 used 0.5s) since a longer dissolve has no
downside once no subject is moving through it.

```sh
ffmpeg -i src.mp4 -filter_complex "
[0:v]crop=960:600:0:170,scale=720:450,setsar=1,split=3[a][b][c];
[a]trim=0:0.8,setpts=PTS-STARTPTS[head];
[b]trim=0.8:4.2,setpts=PTS-STARTPTS[body];
[c]trim=4.2:5.0,setpts=PTS-STARTPTS[tail];
[tail][head]blend=all_expr='A*(1-T/0.8)+B*(T/0.8)'[mix];
[mix][body]concat=n=2:v=1:a=0[out]" -map "[out]" -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 30 -preset veryslow \
  -g 48 -movflags +faststart -y lifestyle-dusk-720.mp4

# poster = frame 0 of the FINAL video, so the paint matches playback exactly
ffmpeg -i lifestyle-dusk-720.mp4 -frames:v 1 -c:v libwebp -quality 72 -y lifestyle-dusk-720.webp
ffmpeg -i lifestyle-dusk-720.mp4 -frames:v 1 -q:v 6 -y lifestyle-dusk-720.jpg
```

Measured output: **MP4 250KB · WebP poster 21KB · JPEG poster 26KB.**

## Why no WebM

VP9 was encoded and measured, not assumed. Dense floral bokeh plus film grain is close to
VP9's worst case here: at matched quality (crf 42) it came out **244KB vs H.264's 250KB** —
no meaningful win — and only got smaller by visibly degrading the grass and bokeh (crf 46 =
187KB). Since H.264-in-MP4 is universally supported by every browser FemWell targets, a
second file would have added a fetch and a build step to save nothing. Revisit only if a
future clip is flatter/less grainy.

## Naming + variants

`{garden}-{timeofday}-{width}.{ext}` — e.g. `lifestyle-dusk-720.mp4`. `PhotoHero.jsx` maps
day/dusk/night to files via `GARDEN_MEDIA`; only dusk exists, so all three slots point at it.
Drop in `lifestyle-day-720.*` and change that one map entry — no call sites change.

## Verify the seam (REQUIRED — no visual cue hides it anymore)

After encoding, prove the loop join is invisible by comparing SSIM at the join against a
normal mid-clip frame-to-frame delta. Dusk-meadow grain + moving grass means even adjacent
frames score ~0.76, so an ABSOLUTE SSIM near 1.0 is not the bar — the bar is "join ≈ normal
adjacent delta".

```sh
ffmpeg -ss 4.16 -i loop.mp4 -frames:v 1 last.png     # last body frame
ffmpeg -ss 0.0  -i loop.mp4 -frames:v 1 first.png    # first (start of baked dissolve)
ffmpeg -ss 2.00 -i loop.mp4 -frames:v 1 a.png; ffmpeg -ss 2.042 -i loop.mp4 -frames:v 1 b.png
ffmpeg -i last.png -i first.png -lavfi ssim=stats_file=- -f null -   # the JOIN
ffmpeg -i a.png    -i b.png     -lavfi ssim=stats_file=- -f null -   # NORMAL adjacent
```

v3 measured: join **All:0.771**, normal adjacent **All:0.765** — the join is indistinguishable
from ordinary playback. If the join scores materially BELOW the adjacent baseline, the source
didn't loop and the crossfade needs lengthening.
