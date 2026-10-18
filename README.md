# Dreamare World

Official website and hidden Dream Archive entry for the music project **Dreamare**.

## Project files

- `index.html` — public Dreamare landing page, album sections and discreet Archive entry
- `styles.css` — responsive cinematic styling
- `archive/index.html` — unlisted Archive portal and Record 047 recovery form
- `archive/recovery.js` — client for future Cloudflare Worker integration

## Security and deployment

The public repository intentionally contains **no recovery key and no protected Record 047 prose**. The form remains unavailable until a server-side Cloudflare Worker is deployed and configured. A four-digit ARG key is not suitable for sensitive information, even with request throttling.

GitHub Pages: Repository Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

When Pages is enabled, the test URL is expected to be:
https://mitchprietoeurope.github.io/dreamareworld/

Later, map the purchased `dreamareworld.com` domain to GitHub Pages. Add genuine official music links, imagery, and Cloudflare Worker API configuration before launch.

## Status

Initial frontend and archive entry committed to `main`. GitHub Pages activation, final imagery, protected story storage and Worker validation are pending.
