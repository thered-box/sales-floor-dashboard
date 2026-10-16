# Winner Roofing — Sales Floor dashboard

A Winner Roofing–branded copy of the Sales Floor Dashboard template in the repo root.
**Winner Roofing is a fictitious brand**; every rep, customer and number on the board is
sample data.

| | |
|---|---|
| **Live** | https://winnerroofing.m411.app/ |
| Also at | https://winner-roofing-sales-floor.b411.workers.dev/ |
| Cloudflare Worker | `winner-roofing-sales-floor` (no bindings, no secrets) |
| Access | open link; `noindex` headers and a `Disallow: /` robots.txt keep it out of search |

## Modes

| URL | Shows |
|---|---|
| `/` | sample data (default for this edition: `demoByDefault: true` in `config.js`) |
| `/?demo=0` | the blank board, as it would look before a data feed is connected |
| `/?demo=1` | sample data, explicitly |

The footer link switches between the two. The sample data follows the calendar: it always
shows the current month to date (or last month in full during the first six days), and the
calls slide is the current Mon–Fri week to date.

## What differs from the template

- **Branding.** The logo appears in the top bar and on the cover slide (`logo` in `config.js`,
  a new optional key). Trophy gold `#DBB568` is the accent for numbers and highlights, and
  brand red `#E21E25` is used for the top stripe and background glow. Red is deliberately
  kept off the numbers: the New Lead timer uses red to mean "past SLA". Also new: favicon,
  page title, and "WINNER ROOFING · SALES FLOOR" in the top bar.
- **Sample data** (`sample-data.js`): four fictitious reps, homeowner and commercial
  roofing jobs, roofing-sized amounts, no Sunday activity.
- **Two chart fixes** that the larger roofing amounts exposed (both also help a real feed):
  - Monthly running total: end-of-line labels are spaced apart vertically and outlined,
    so reps who finish close together no longer print on top of each other.
  - Daily cash: bar labels shorten to `$42K` / `$5.4K` and shrink when the full amount
    would not fit its column.

## Logos

Source: Zoho WorkDrive, the folder holding `Winner Roofing.ai`, `Winner Roofing Logo.ai`
and `Winner Roofing.jpg`. The `.ai` files are PDF-compatible. `assets/` was rendered from
`Winner Roofing.ai` (the black-and-red shield badge, which reads best on the dark board):

```bash
pdftocairo -png -transp -r 216 -singlefile "Winner Roofing.ai" badge
# then: crop to the artwork, resize → assets/winner-roofing-badge.png (480px tall),
#       pad square → assets/favicon-64.png, assets/apple-touch-icon.png
```

`Winner Roofing Logo.ai` also has a red-shield version and a trophy + wordmark lockup,
if a different mark is wanted later.

## Redeploying after a change

Every site file is inlined into the Worker at build time, so any edit needs a redeploy.
From this folder:

```bash
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... \
HOSTNAME_FQDN=winnerroofing.m411.app ./deploy/deploy.sh
```

`deploy/build.py` writes the bundle to `deploy/dist/` (gitignored); `deploy/deploy.sh`
uploads it, keeps the `workers.dev` URL on, and (re)attaches the custom domain. Leave
`HOSTNAME_FQDN` unset to skip the domain step. The token needs Workers Scripts edit plus
Workers Routes edit on the `m411.app` zone; the account id and token are never stored here.

To move the board to the bare `m411.app` instead, run the same command with
`HOSTNAME_FQDN=m411.app`, then remove the `winnerroofing` domain in Cloudflare → Workers →
winner-roofing-sales-floor → Settings → Domains & Routes.

## Connecting real data later

Set `dataUrl` in `config.js` to a URL returning the JSON described in the root `README.md`
(`data.example.json` is a copy-me example), then redeploy. The Worker's CSP already allows
fetching from any `https:` origin. To stop showing sample data, set `demoByDefault: false`
or delete `sample-data.js`.

## Files

| File | What it is |
|---|---|
| `index.html` | the dashboard (copied from the template; branding + chart fixes) |
| `config.js` | Winner Roofing branding, reps, demo-by-default |
| `sample-data.js` | fictitious roofing sample data |
| `data.example.json` | unchanged copy of the template's live-feed example |
| `assets/` | badge logo, favicon, apple-touch icon |
| `deploy/worker.js` | the Worker: serves the files, adds security headers |
| `deploy/build.py` | inlines the site into `deploy/dist/worker.js` |
| `deploy/deploy.sh` | build → upload → workers.dev → custom domain |
