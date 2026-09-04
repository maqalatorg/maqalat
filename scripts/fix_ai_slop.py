#!/usr/bin/env python3
"""
Mechanical AI-slop fixes across all MDX articles.

SAFE PASSES:
  1. Strip decorative emojis from prose (keeps code blocks intact)
  2. Convert inline em-dash ( — ) to appropriate punctuation
  3. Downgrade `- **X**:` bullets to `- X:` (removes visual over-emphasis)
  4. Rename "دليل شامل" / "شرح شامل" in titles/descriptions to variant phrasing
  5. Remove "شامل" / "معمّق" from descriptions when overused

Modes:
  --dry-run  : Report only, no writes
  --apply    : Modify files in place

Usage:
  python scripts/fix_ai_slop.py --dry-run
  python scripts/fix_ai_slop.py --apply
"""
import argparse
import re
import sys
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

ARTICLES_DIR = Path(__file__).parent.parent / "content" / "articles"

EMOJI_PATTERN = re.compile(
    "["
    "☀-⛿"
    "✀-➿"
    "\U0001F300-\U0001F5FF"
    "\U0001F600-\U0001F64F"
    "\U0001F680-\U0001F6FF"
    "\U0001F700-\U0001F77F"
    "\U0001F900-\U0001F9FF"
    "\U0001FA00-\U0001FA6F"
    "\U0001FA70-\U0001FAFF"
    "\U0001F1E0-\U0001F1FF"
    "]",
    flags=re.UNICODE
)

CODE_BLOCK = re.compile(r"```.*?```", re.DOTALL)
INLINE_CODE = re.compile(r"`[^`\n]+`")

# Em-dash with surrounding spaces (inline usage). NOT the standalone --- separator.
EM_DASH_INLINE = re.compile(r" — ")

# Bullet lines like: `- **Text**:` or `- **Text** :`
BULLET_BOLD_COLON = re.compile(r"^(-\s+)\*\*([^*\n]+?)\*\*\s*([:：])", re.MULTILINE)

# Numbered list items like: `1. **Text**:`
NUMBERED_BOLD_COLON = re.compile(r"^(\d+\.\s+)\*\*([^*\n]+?)\*\*\s*([:：])", re.MULTILINE)

# YAML-only "دليل شامل / شرح شامل" cleanups (title/description lines)
TITLE_SHAMEL = re.compile(r'^(title|description):\s*"([^"]*)"', re.MULTILINE)


def _split_frontmatter(text: str) -> tuple[str, str]:
    """Return (frontmatter_including_delimiters, body). Handles CRLF/LF."""
    m = re.match(r"^(---\r?\n.*?\r?\n---\r?\n)(.*)$", text, re.DOTALL)
    if m:
        return m.group(1), m.group(2)
    return "", text


def strip_emojis_preserving_code(text: str) -> tuple[str, int]:
    """Remove emojis from prose, preserving code blocks and indentation."""
    total_removed = 0
    parts = []
    last = 0
    for m in CODE_BLOCK.finditer(text):
        prose = text[last:m.start()]
        cleaned, n = EMOJI_PATTERN.subn("", prose)
        total_removed += n
        parts.append(cleaned)
        parts.append(m.group(0))
        last = m.end()
    tail = text[last:]
    cleaned_tail, n = EMOJI_PATTERN.subn("", tail)
    total_removed += n
    parts.append(cleaned_tail)
    result = "".join(parts)
    # Only collapse repeated INNER whitespace (never at line start).
    # Fix repeated space in middle of line: "text   text" -> "text text"
    result = re.sub(r"(?<=\S) {2,}(?=\S)", " ", result)
    # Fix "text ," -> "text,"  (single space before Arabic/Latin punctuation)
    result = re.sub(r"(?<=\S) +([،.:؛!؟,])", r"\1", result)
    return result, total_removed


def convert_em_dashes(text: str) -> tuple[str, int]:
    """
    Convert inline em-dashes ( — ) to Arabic comma or period.
    Heuristics:
      - If preceded by a full sentence marker (. ! ؟) recently, use period.
      - Default: use Arabic comma (،).
    Skip inside code blocks.
    """
    total = 0
    parts = []
    last = 0
    for m in CODE_BLOCK.finditer(text):
        segment = text[last:m.start()]
        # Preserve inline code
        icodes = []
        def _stash(match):
            icodes.append(match.group(0))
            return f"\x00{len(icodes)-1}\x00"
        segment_stashed = INLINE_CODE.sub(_stash, segment)

        new_segment, n = EM_DASH_INLINE.subn("، ", segment_stashed)
        total += n

        def _restore(match):
            idx = int(match.group(1))
            return icodes[idx]
        new_segment = re.sub(r"\x00(\d+)\x00", _restore, new_segment)

        parts.append(new_segment)
        parts.append(m.group(0))
        last = m.end()

    tail = text[last:]
    icodes = []
    def _stash2(match):
        icodes.append(match.group(0))
        return f"\x00{len(icodes)-1}\x00"
    tail_stashed = INLINE_CODE.sub(_stash2, tail)
    new_tail, n = EM_DASH_INLINE.subn("، ", tail_stashed)
    total += n

    def _restore2(match):
        idx = int(match.group(1))
        return icodes[idx]
    new_tail = re.sub(r"\x00(\d+)\x00", _restore2, new_tail)
    parts.append(new_tail)

    return "".join(parts), total


def downgrade_bullet_bold(text: str) -> tuple[str, int]:
    """Convert `- **Text**:` into `- Text:` (removes decorative bold)."""
    total = 0
    def repl(m):
        nonlocal total
        total += 1
        return f"{m.group(1)}{m.group(2)}{m.group(3)}"
    result = BULLET_BOLD_COLON.sub(repl, text)
    result = NUMBERED_BOLD_COLON.sub(repl, result)
    return result, total


def clean_shamel(text: str) -> tuple[str, int]:
    """Replace overused `دليل شامل` / `شرح شامل` in YAML title/description.
    Rewrites in a way that varies phrasing (avoids the 'شامل' AI signature).
    """
    total = 0
    def repl(m):
        nonlocal total
        key = m.group(1)
        val = m.group(2)
        original = val
        # Only strip when whitespace present so we don't break attached prefixes like "لـ"
        val = re.sub(r"^دليل شامل عن ", "دليل ", val)
        val = re.sub(r"^دليل شامل ل ", "دليل ", val)  # rare
        val = re.sub(r"^دليل شامل\s*[:،]\s*", "دليل ", val)
        val = re.sub(r"^دليل شامل ", "دليل ", val)
        val = re.sub(r"^شرح شامل عن ", "شرح ", val)
        val = re.sub(r"^شرح شامل ل ", "شرح ", val)
        val = re.sub(r"^شرح شامل ", "شرح ", val)
        # Mid-value occurrences (description only)
        if key == "description":
            val = re.sub(r"شرح شامل عن ", "شرح ", val)
            val = re.sub(r"دليل شامل عن ", "دليل ", val)
            val = re.sub(r"شرح شامل ل", "شرح لـ", val)
            val = re.sub(r"دليل شامل ل", "دليل لـ", val)
            val = re.sub(r"شرح شامل", "شرح", val)
            val = re.sub(r"دليل شامل", "دليل", val)
        if val != original:
            total += 1
        return f'{key}: "{val}"'
    return TITLE_SHAMEL.sub(repl, text), total


def process_file(filepath: Path, apply: bool) -> dict:
    original = filepath.read_text(encoding="utf-8")
    frontmatter, body = _split_frontmatter(original)

    # Body: full treatment
    body, n_emoji = strip_emojis_preserving_code(body)
    body, n_dash_body = convert_em_dashes(body)
    body, n_bullet = downgrade_bullet_bold(body)

    # Frontmatter: only touch title/description لـshamel + em-dash within values
    # NEVER touch YAML indentation
    fm_new = frontmatter
    fm_new, n_shamel = clean_shamel(fm_new)
    # Convert em-dashes only within double-quoted YAML values
    n_dash_fm = 0
    def _repl_yaml_value(m):
        nonlocal n_dash_fm
        val = m.group(2)
        new_val, n = EM_DASH_INLINE.subn("، ", val)
        n_dash_fm += n
        return f'{m.group(1)}"{new_val}"'
    fm_new = re.sub(r'(:\s*)"([^"\n]*)"', _repl_yaml_value, fm_new)

    content = fm_new + body
    changed = content != original
    if apply and changed:
        filepath.write_text(content, encoding="utf-8")

    return {
        "file": filepath.name,
        "changed": changed,
        "emojis_removed": n_emoji,
        "em_dashes_converted": n_dash_body + n_dash_fm,
        "bullets_downgraded": n_bullet,
        "shamel_cleaned": n_shamel,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply fixes")
    parser.add_argument("--dry-run", action="store_true", help="Report only (default)")
    parser.add_argument("--only", type=str, help="Comma-separated filenames (or substrings) to limit to")
    args = parser.parse_args()

    apply = args.apply
    files = sorted(ARTICLES_DIR.glob("*.mdx"))

    if args.only:
        needles = [s.strip() for s in args.only.split(",")]
        files = [f for f in files if any(n in f.name for n in needles)]

    print("=" * 70)
    print(f"FIX SCRIPT — {'APPLY' if apply else 'DRY-RUN'} — {len(files)} files")
    print("=" * 70)

    results = [process_file(f, apply) for f in files]
    changed = [r for r in results if r["changed"]]

    total_emoji = sum(r["emojis_removed"] for r in results)
    total_dash = sum(r["em_dashes_converted"] for r in results)
    total_bullet = sum(r["bullets_downgraded"] for r in results)
    total_shamel = sum(r["shamel_cleaned"] for r in results)

    print(f"\n[SUMMARY]")
    print(f"  Files changed:               {len(changed)} / {len(results)}")
    print(f"  Emojis removed:              {total_emoji}")
    print(f"  Em-dashes converted:         {total_dash}")
    print(f"  Bullet-bold-colon cleaned:   {total_bullet}")
    print(f"  Title/desc `شامل` cleaned:   {total_shamel}")

    # Show top 20 changed files
    print(f"\n[TOP 20 MOST CHANGED]")
    top = sorted(results, key=lambda r: -(r["emojis_removed"] + r["em_dashes_converted"] + r["bullets_downgraded"]))[:20]
    for r in top:
        total = r["emojis_removed"] + r["em_dashes_converted"] + r["bullets_downgraded"] + r["shamel_cleaned"]
        if total > 0:
            print(f"  emoji={r['emojis_removed']:>3}  dash={r['em_dashes_converted']:>3}  bullet={r['bullets_downgraded']:>3}  shamel={r['shamel_cleaned']}  {r['file']}")

    if not apply:
        print(f"\n[DRY-RUN] No files modified. Rerun with --apply to write changes.")


if __name__ == "__main__":
    main()
