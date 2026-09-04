#!/usr/bin/env python3
"""
Audit script for detecting AI-slop patterns across all MDX articles.
Reports counts only — no modifications.
Run: python scripts/audit_ai_slop.py
"""
import os
import re
import json
from pathlib import Path

ARTICLES_DIR = Path(__file__).parent.parent / "content" / "articles"

# Emojis that leak into prose (checkmarks, warnings, sparkles, etc.)
# Excludes ordinary text — targets decorative emoji
EMOJI_PATTERN = re.compile(
    "["
    "☀-⛿"        # Misc symbols (☀ ☁ ⚠ etc.)
    "✀-➿"        # Dingbats (✓ ✅ ✗ ❌ etc.)
    "\U0001F300-\U0001F5FF"  # Symbols & pictographs
    "\U0001F600-\U0001F64F"  # Emoticons
    "\U0001F680-\U0001F6FF"  # Transport & map
    "\U0001F700-\U0001F77F"
    "\U0001F900-\U0001F9FF"  # Supplemental symbols
    "\U0001FA00-\U0001FA6F"
    "\U0001FA70-\U0001FAFF"
    "\U0001F1E0-\U0001F1FF"  # Flags
    "]",
    flags=re.UNICODE
)

# Em-dash surrounded by spaces (AI signature)
EM_DASH_INLINE = re.compile(r" — ")

# Bullet pattern: `- **text**:` (AI structural pattern)
BULLET_BOLD_COLON = re.compile(r"^-\s+\*\*[^*]+\*\*[:：]", re.MULTILINE)

# AI-typical Arabic phrases
AI_PHRASES = [
    "من الضروري ملاحظة",
    "تجدر الإشارة",
    "في نهاية المطاف",
    "في هذا المقال",
    "دعونا نستكشف",
    "الجدير بالذكر",
    "في عالم يتطوّر",
    "في عالم يتطور",
    "سيف بحدّين",
    "سيف ذو حدّين",
    "من الأفضل وللأسوأ",
    "من الأفضل إلى الأسوأ",
    "المستقبل يحمل",
    "يوازن الصورتين",
    "يوازن الصورتَين",
    "الشركات التي تفهم هذا",
    "الحلّ السحري",
    "الحل السحري",
    "شامل عن كل شيء",
    "شامل عن كل ما",
    "دليل شامل",
    "شرح شامل",
]

# Numbered opener in FAQ answers ("خمسة", "ستّة", "أربعة", "سبعة", "ثلاثة")
NUMBERED_OPENERS = ["خمسة", "ستة", "ستّة", "أربعة", "سبعة", "ثلاثة", "ثلاث", "أربع", "خمس", "ست", "سبع"]

# Prophetic closing patterns (rough)
PROPHETIC_CLOSINGS = [
    r"الشركات التي تفهم هذا",
    r"من ينسى (هاتين|هذا)",
    r"مسيرت[هه] المهنية في خطر",
    r"ضحية قادمة",
    r"ضحيّة قادمة",
    r"مستقبل غير مؤكّد",
    r"مستقبل غير مؤكد",
]


def count_faq_numbered_openers(content: str) -> int:
    """Count FAQ answers that open with a number word."""
    count = 0
    # Match YAML frontmatter FAQ answers: "    a: \"<content>\""
    # Simple heuristic: lines starting with "    a: \"" (4 spaces indent)
    for match in re.finditer(r'^\s+a:\s*"([^"]{1,80})', content, re.MULTILINE):
        opener = match.group(1).strip()
        # Check first 2-3 words
        first_words = opener.split()[:3]
        for word in first_words:
            # Strip common punctuation
            clean = word.strip("،.!?:؛()")
            if clean in NUMBERED_OPENERS:
                count += 1
                break
    return count


def audit_file(filepath: Path) -> dict:
    content = filepath.read_text(encoding="utf-8")
    return {
        "file": filepath.name,
        "size_kb": round(len(content) / 1024, 1),
        "emojis": len(EMOJI_PATTERN.findall(content)),
        "em_dashes": len(EM_DASH_INLINE.findall(content)),
        "bullet_bold_colon": len(BULLET_BOLD_COLON.findall(content)),
        "faq_numbered_openers": count_faq_numbered_openers(content),
        "ai_phrases": {
            phrase: content.count(phrase)
            for phrase in AI_PHRASES
            if content.count(phrase) > 0
        },
        "prophetic_closings": sum(
            len(re.findall(pat, content)) for pat in PROPHETIC_CLOSINGS
        ),
    }


def main():
    files = sorted(ARTICLES_DIR.glob("*.mdx"))
    results = [audit_file(f) for f in files]

    # Aggregate stats
    total_emojis = sum(r["emojis"] for r in results)
    total_em_dashes = sum(r["em_dashes"] for r in results)
    total_bullet_patterns = sum(r["bullet_bold_colon"] for r in results)
    total_faq_openers = sum(r["faq_numbered_openers"] for r in results)
    total_prophetic = sum(r["prophetic_closings"] for r in results)

    files_with_emojis = sum(1 for r in results if r["emojis"] > 0)
    files_with_high_dashes = sum(1 for r in results if r["em_dashes"] > 8)
    files_with_bullets = sum(1 for r in results if r["bullet_bold_colon"] > 5)

    # Top offenders
    top_emoji = sorted(results, key=lambda r: -r["emojis"])[:15]
    top_dashes = sorted(results, key=lambda r: -r["em_dashes"])[:15]
    top_bullets = sorted(results, key=lambda r: -r["bullet_bold_colon"])[:15]
    top_ai_phrases = sorted(results, key=lambda r: -sum(r["ai_phrases"].values()))[:15]

    print("=" * 70)
    print(f"AUDIT REPORT — {len(files)} MDX articles")
    print("=" * 70)
    # Force UTF-8 output on Windows
    import sys
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")

    print(f"\n[TOTALS]")
    print(f"  Emojis in prose:                 {total_emojis:>6}  ({files_with_emojis} files affected)")
    print(f"  Em-dashes ( - ):                 {total_em_dashes:>6}  ({files_with_high_dashes} files with >8)")
    print(f"  Bullet-bold-colon patterns:      {total_bullet_patterns:>6}  ({files_with_bullets} files with >5)")
    print(f"  FAQ numbered openers:            {total_faq_openers:>6}")
    print(f"  Prophetic closings:              {total_prophetic:>6}")

    print(f"\n[TOP 15 EMOJI OFFENDERS]")
    for r in top_emoji:
        if r["emojis"] > 0:
            print(f"  {r['emojis']:>4}  {r['file']}")

    print(f"\n[TOP 15 EM-DASH OFFENDERS]")
    for r in top_dashes:
        if r["em_dashes"] > 8:
            print(f"  {r['em_dashes']:>4}  {r['file']}")

    print(f"\n[TOP 15 BULLET-BOLD-COLON OFFENDERS]")
    for r in top_bullets:
        if r["bullet_bold_colon"] > 5:
            print(f"  {r['bullet_bold_colon']:>4}  {r['file']}")

    phrase_totals = {}
    for r in results:
        for phrase, count in r["ai_phrases"].items():
            phrase_totals[phrase] = phrase_totals.get(phrase, 0) + count
    print(f"\n[AI-TYPICAL PHRASES total occurrences]")
    for phrase, count in sorted(phrase_totals.items(), key=lambda x: -x[1]):
        print(f"  {count:>4}  \"{phrase}\"")

    report_path = Path(__file__).parent / "audit_report.json"
    report_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[JSON report] {report_path}")


if __name__ == "__main__":
    main()
