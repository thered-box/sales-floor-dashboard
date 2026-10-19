# CLAUDE.md — sales-floor-dashboard

A CRM-agnostic, full-screen sales scoreboard for a TV: one `index.html`, a `config.js`,
sample data, and a documented JSON feed schema (see `README.md`). MIT-licensed so it can
be rebranded or handed to clients. **It does not deploy from this repo today** and has no
live data feed wired.

## Part of the Business 411 operating system

The hub repo [`thered-box/b411-os`](https://github.com/thered-box/b411-os) (formerly
`GeneralB411`) holds the shared knowledge every agent reads first — systems map, data
definitions, Zoho query mechanics, decisions log, shared memory. Read its `CLAUDE.md`
before changing anything that touches real numbers. This repo belongs to the **sales**
area (`work/sales/` in the hub).

## Rules here

- Keep it a plain static site: HTML, CSS and one JavaScript file, no build step.
- The JSON schema in `README.md` is the contract. If you change it, change the README,
  `data.example.json` and `sample-data.js` in the same commit.
- When a live feed is wired, it must be produced by the same Zoho pulls the hub's Sales
  Report uses (one pipeline, two consumers) — see the hub's `work/sales/README.md`.
- No secrets in this repo. `dataUrl` points at a feed that does its own auth.
- Work on a branch and open a pull request.
