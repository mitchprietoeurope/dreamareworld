# Dream Archive — private Record #047 API

The public GitHub Pages frontend stays in `archive/`. The protected record and the
four-digit recovery key MUST NOT be added to this repository, including git history,
issues, frontend JavaScript or a `.dev.vars` file committed to git.

## Cloudflare setup

1. Create/log in to a Cloudflare account; install Node.js on your PC.
2. From this repository directory, run `npx wrangler login`.
3. Run `npx wrangler deploy --config worker/wrangler.jsonc` (the Worker will be created as `dreamare-archive`).
4. In Cloudflare **Workers & Pages → dreamare-archive → Settings → Variables and Secrets**, add THREE **Secret** entries:
   - `RECOVERY_KEY_047`: the approved four-digit recovery key (never commit it).
   - `RECORD_047_PART_1`: copy the complete JSON from the Google Doc titled
     **DREAM ARCHIVE — 047 — CLOUDFLARE SECRET PART 1**.
     It contains `{"title":"The Box and the Password","paragraphs":[...]}`.
   - `RECORD_047_PART_2`: copy the complete JSON from the Google Doc titled
     **DREAM ARCHIVE — 047 — CLOUDFLARE SECRET PART 2**.
     It contains `{"paragraphs":[...],"archivistNote":[...]}`.
   The Worker merges the two story arrays and includes the note only after a
   validated recovery. Splitting is required because Cloudflare imposes a 5 KB
   maximum per environment variable. Each part is below this limit.
   The previous single-secret name `RECORD_047_JSON` is NOT used.
5. After deploying and configuring secrets, set the **public Worker URL only** in `archive/config.js`,
   e.g. `window.DREAM_ARCHIVE_API_BASE = "https://dreamare-archive.<your-subdomain>.workers.dev";`.
   This URL is public; it does not contain a password or story.
6. Open the site `/dreamareworld/archive/` and test an incorrect key first, then the correct key.
   The eye closes only when the Worker returns a valid authorized record.

## Contract and safety

- `POST /recover` with `{"record":"047","key":"0000"}`. That is an example format, NOT the real key.
- A successful request responds with `{title, paragraphs, archivistNote}`.
- The Worker allows browser requests only from `https://mitchprietoeurope.github.io`.
- Requests are throttled per-IP (3/minute) and globally (25/minute) with Cloudflare
  Workers rate-limit bindings. Cloudflare states these counters are approximate and
  scoped per Cloudflare location. A four-digit recovery key is inherently weak;
  add Turnstile or stronger authorization before treating any content as genuinely confidential.
- If the Cloudflare rate-limit binding is unavailable for the account, do NOT disable
  it and deploy an unthrottled recovery endpoint.
- The recovery endpoint is **not deployed** just because this code exists on GitHub.
