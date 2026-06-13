#!/usr/bin/env python3
"""Generate content with Claude Fable 5 (claude-fable-5).

Streams the result to stdout (or a file). Designed for long-form / creative
generation. See the SKILL.md in the parent directory for usage and the
Fable-5-specific choices baked in here.
"""

import argparse
import sys

MODEL = "claude-fable-5"
FALLBACK_MODEL = "claude-opus-4-8"
FALLBACK_BETA = "server-side-fallback-2026-06-01"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Generate content with Claude Fable 5.")
    p.add_argument("--prompt", help="The request. If omitted, read from stdin.")
    p.add_argument("--system", help="Optional system prompt (persona, voice, constraints).")
    p.add_argument(
        "--effort",
        choices=["low", "medium", "high", "xhigh", "max"],
        default="high",
        help="Generation depth/cost (default: high).",
    )
    p.add_argument(
        "--max-tokens",
        type=int,
        default=16000,
        help="Output token cap (default: 16000; up to 128000).",
    )
    p.add_argument("--out", help="Write output to this file instead of stdout.")
    p.add_argument(
        "--no-fallback",
        action="store_true",
        help="Disable the automatic Opus 4.8 refusal fallback.",
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()

    prompt = args.prompt if args.prompt is not None else sys.stdin.read()
    if not prompt.strip():
        print("error: no prompt provided (use --prompt or pipe via stdin)", file=sys.stderr)
        return 2

    try:
        import anthropic
    except ImportError:
        print("error: the 'anthropic' package is required (pip install anthropic)", file=sys.stderr)
        return 2

    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

    # Build request kwargs. Note: no `thinking` param — on Fable 5 thinking is
    # always on and `output_config.effort` controls depth.
    kwargs: dict = {
        "model": MODEL,
        "max_tokens": args.max_tokens,
        "output_config": {"effort": args.effort},
        "messages": [{"role": "user", "content": prompt}],
    }
    if args.system:
        kwargs["system"] = args.system

    use_fallback = not args.no_fallback
    if use_fallback:
        kwargs["betas"] = [FALLBACK_BETA]
        kwargs["fallbacks"] = [{"model": FALLBACK_MODEL}]
        stream_ctx = client.beta.messages.stream(**kwargs)
    else:
        stream_ctx = client.messages.stream(**kwargs)

    chunks: list[str] = []
    to_stdout = args.out is None
    try:
        with stream_ctx as stream:
            for text in stream.text_stream:
                chunks.append(text)
                if to_stdout:
                    print(text, end="", flush=True)
            final = stream.get_final_message()
    except anthropic.BadRequestError as e:
        # Most likely: ZDR org (Fable 5 needs 30-day retention) or invalid params.
        print(f"\nerror: bad request: {e.message}", file=sys.stderr)
        return 1
    except anthropic.APIError as e:
        print(f"\nerror: API error: {e}", file=sys.stderr)
        return 1

    if to_stdout:
        print()  # trailing newline after the streamed text

    # A refusal (whole chain, after any fallback) means the request was declined.
    if final.stop_reason == "refusal":
        category = getattr(final.stop_details, "category", None) if final.stop_details else None
        print(f"\nrefused: the request was declined (category: {category}).", file=sys.stderr)
        return 1

    if args.out:
        with open(args.out, "w") as f:
            f.write("".join(chunks))
        print(f"wrote {args.out} (served by {final.model})", file=sys.stderr)
    else:
        # Note on stderr so it doesn't pollute the generated content on stdout.
        if final.model != MODEL:
            print(f"\n[served by {final.model} via refusal fallback]", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
