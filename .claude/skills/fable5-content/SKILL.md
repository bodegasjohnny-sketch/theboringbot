---
name: fable5-content
description: >-
  Generate long-form or creative content with Claude Fable 5 (claude-fable-5),
  Anthropic's most capable model. Use when the user wants high-quality drafting,
  rewriting, brainstorming, narrative/marketing copy, or any demanding
  open-ended generation and explicitly wants "Fable 5", "the most capable
  model", or top-tier writing quality. Calls the Claude API directly; not tied
  to any one project.
---

# Fable 5 content generation

A thin, reusable wrapper around the Claude API using `claude-fable-5` — Anthropic's
most capable widely released model — tuned for long-form and creative generation.

## When to use this

Reach for this skill when the task is generation-heavy and quality-sensitive and the
user has signalled they want Fable 5 (or "the most capable model" / "the best writing").
Examples: long-form articles, narrative or marketing copy, scripts, detailed
brainstorms, careful rewrites. For routine edits, classification, or anything where a
cheaper model is fine, do not reach for Fable 5 — it is the most expensive tier
($10/$50 per MTok).

## How to invoke

Run the helper script. It reads the prompt from `--prompt` or from stdin, streams the
result to stdout, and exits non-zero on refusal or error.

```bash
# Inline prompt
python3 scripts/generate.py --prompt "Write a 600-word founder's letter about ..."

# Prompt from a file (or any stdin)
python3 scripts/generate.py < brief.md

# With a system prompt and effort level
python3 scripts/generate.py \
  --system "You are a senior brand copywriter. Warm, concrete, no clichés." \
  --effort high \
  --prompt "Draft 5 landing-page headlines for an AI growth lab."

# Save output to a file instead of stdout
python3 scripts/generate.py --prompt "..." --out draft.md
```

Flags:
- `--prompt TEXT` — the user request. If omitted, the script reads stdin.
- `--system TEXT` — optional system prompt (persona, constraints, voice).
- `--effort {low,medium,high,xhigh,max}` — generation depth/cost (default `high`).
- `--max-tokens N` — output cap (default `16000`; raise for very long pieces, up to 128000).
- `--out PATH` — write the result to a file instead of stdout.
- `--no-fallback` — disable the automatic Opus 4.8 refusal fallback (see below).

## What the script does (and why)

These are deliberate, Fable-5-specific choices — do not "fix" them to match older
models:

- **Model `claude-fable-5`.** The single most capable model; pricing exceeds Opus tier.
- **Thinking is always on — the `thinking` parameter is omitted entirely.** On Fable 5,
  thinking can't be disabled; sending `thinking: {type: "disabled"}` returns a 400, and
  `budget_tokens` is removed. Depth is controlled via `output_config.effort` instead.
- **Streaming.** Long generations can run for minutes; streaming avoids HTTP timeouts and
  shows progress. The final message is collected to check the stop reason.
- **Server-side refusal fallback on by default.** Safety classifiers occasionally decline
  benign requests (HTTP 200 with `stop_reason: "refusal"`). The script opts into the
  server-side `fallbacks` parameter (`betas=["server-side-fallback-2026-06-01"]`,
  `fallbacks=[{"model": "claude-opus-4-8"}]`) so a false-positive decline is transparently
  re-served by Opus 4.8 in the same call. Disable with `--no-fallback`.
- **No assistant prefill.** Prefills 400 on Fable 5; shape output via the system prompt.
- **`effort` default `high`.** Good quality/cost balance; use `xhigh`/`max` for the hardest
  pieces, `low`/`medium` for routine drafting.

## Requirements

- `pip install anthropic` (the official Anthropic Python SDK).
- `ANTHROPIC_API_KEY` set in the environment.
- The org must allow **30-day data retention** — Fable 5 is not available under zero data
  retention (a ZDR org returns `400 invalid_request_error` on every request).

## Installing this skill globally

This skill lives in the repo so it is version-controlled. To make it a personal/global
skill available in every project, copy it into your user skills directory:

```bash
cp -r .claude/skills/fable5-content ~/.claude/skills/
```
