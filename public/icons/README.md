# Kayan PWA icons

**Placeholder status:** these SVG files are placeholders rendered with the
brand palette (Kayan yellow `#FFD700` background, obsidian `#0D0D0D` "K"
glyph). Replace with production PNG assets before launch.

Required production assets:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-512-maskable.png` (512×512, with art inside the maskable safe zone)

Once PNGs are in place, update `public/manifest.json` and
`vite.config.ts` PWA config — swap the `.svg` filenames for `.png` and
set `"type": "image/png"`.
