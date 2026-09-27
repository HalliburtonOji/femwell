# Session transcripts — manifest (raw archive, backup reference only)

> **Read the structured docs first.** `AGENTS.md` → `claude-state/STATUS.md` →
> `claude-state/agent-collab/HANDOFF.md` → `claude-state/BRAND_IDENTITY.md` are the distilled,
> current truth. A transcript is an **un-distilled record of one session** — use it only to answer
> *"why did we decide X?"* when the docs don't say. **If a transcript disagrees with STATUS.md or the
> bible, the docs win** (transcripts contain superseded reasoning by design).

## Why the raw logs are not committed here

The Claude session logs for this project total **~245 MB** (the current build session alone is
**102 MB** of JSONL). Committing them would:

- permanently bloat the repo for every future clone and CI run,
- make the handoff patch undownloadable (a patch embeds full file contents),
- and add no context the structured docs don't already carry.

So this directory holds the **manifest + pull instructions** instead. `*.jsonl` here is gitignored,
so if you *do* copy one in locally for reference it won't accidentally be committed.

**If a specific transcript is genuinely needed** (e.g. to reconstruct a decision that never made it
into STATUS.md), copy just that one and grep it locally — don't commit it.

## Where they live (Halli's machine)

```
C:\Users\Halli\.claude\projects\C--Users-Halli-femwell-work\<session-id>.jsonl
```

Other project folders exist under `C:\Users\Halli\.claude\projects\` (Dispatch/other repos); the
FemWell build sessions are the ones below.

## Inventory — as of 2026-09-27

| Session file | Size | Last written |
|---|---|---|
| `231d4a39-c8df-4131-bcd9-a61bf1916877.jsonl` | 102.3 MB | Sep 27 |
| `4c935290-c307-4561-8137-101648895cc4.jsonl` | 65.3 MB | Sep 19 |
| `2151d039-63d9-466f-8da6-091f0b3d74fe.jsonl` | 11.5 MB | Sep 20 |
| `b179d52d-6481-408c-ade7-e3226d2d262d.jsonl` | 10.9 MB | Sep 17 |
| `d7297b2b-ee79-401a-9d7b-5711520fdc0f.jsonl` | 10.1 MB | Sep 19 |
| `d7059fc5-061d-4217-87e5-2f732c08767a.jsonl` | 2.0 MB | Sep 20 |
| `c25ba0a7-4dde-4afc-9299-a912477efdff.jsonl` | 1.7 MB | Sep 17 |
| `15d57523-9602-4095-adb0-95ae3a753df3.jsonl` | 1.4 MB | Sep 22 |
| `61f1ea8f-1d45-473f-93b0-eefc9bbb5d42.jsonl` | 1.2 MB | Sep 17 |
| `9ff099cb-486a-4faa-aad2-0eb6dc7fff50.jsonl` | 1.0 MB | Sep 17 |
| `890af8dd-52f1-40ec-941e-146aeca63452.jsonl` | 0.7 MB | Sep 19 |

**`231d4a39…`** is the long-running Cowork build session that produced the Lifestyle clean reset,
the composed horoscope, the Books deep pass and the Books cross-app wiring (2026-09-17 → 09-27).

## Reading one without drowning in it

```bash
# what the human actually asked for, in order
grep -o '"role":"user".\{0,400\}' <file>.jsonl | head -50

# find a decision by keyword
grep -o '.\{200\}no-strip.\{400\}' <file>.jsonl | head

# file touches in that session
grep -oE '"file_path":"[^"]+"' <file>.jsonl | sort | uniq -c | sort -rn | head -30
```

## If you want the archive off-machine

Zip and attach out-of-band rather than committing:

```bash
cd "C:/Users/Halli/.claude/projects/C--Users-Halli-femwell-work"
tar -czf femwell_transcripts_$(date +%Y-%m-%d).tar.gz *.jsonl   # ~245 MB raw, far smaller gzipped
```
