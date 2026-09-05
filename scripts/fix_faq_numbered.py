#!/usr/bin/env python3
"""
Transform FAQ answers that open with a number word into natural prose.

BEFORE:
    a: "خمسة استخدامات: (1) X، (2) Y، (3) Z"

AFTER:
    a: "الأدوات الأبرز: X، وY، وZ."

Only touches YAML frontmatter, only faq answers that match the numbered pattern.
"""
import argparse, re, sys, glob
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

NUMBER_WORDS = r"(?:خمسة|ستة|ستّة|أربعة|سبعة|ثلاثة|ثلاث|أربع|خمس|ست|سبع|اثنان|تسعة|عشرة)"

# Matches: "خمسة استخدامات: (1) ..." or "أربع نصائح: (1) ..." etc.
# Captures the label word (e.g., "استخدامات") — allows optional adjective after
LABEL_WORDS = (
    r"استخدامات?|رئيسية?|موصى|قواعد|نصائح|طبقات?|فئات?|أدوات?|خطوات?|أنواع|"
    r"نقاط|أسس|أنماط|مراحل|عوامل|شروط|مبادئ|أسباب|أشياء|طرق|حالات|محاور|"
    r"قطاعات|رائدة|علامات|مخاطر|فوائد|أوجه|جوانب|تحدّيات|تحديات|مصادر|"
    r"خيارات|بدائل|أساليب|طبقتان|طرائق|أقسام|درجات|مستويات|أدوار|"
    r"مناطق|منصّات|منصات|شركات|أمثلة|أحداث|أنشطة|قوانين|لوائح"
)
# Optional adjective right after label word (ثورية، رائدة، مهمّة، رئيسية...)
OPENER_WITH_LABEL = re.compile(
    rf"^{NUMBER_WORDS}\s+({LABEL_WORDS})(?:\s+[^:،(\n]{{2,25}})?\s*[:،]\s*\(1\)\s*",
    re.UNICODE
)
# Matches: "خمسة: (1) ..." (no label)
OPENER_BARE = re.compile(
    rf"^{NUMBER_WORDS}\s*[:،]\s*\(1\)\s*",
    re.UNICODE
)
# Matches the numbered markers (1) (2) (3) etc within an answer
NUM_MARKER = re.compile(r"\(\d+\)\s*")

# Natural connectors to inject at the start (varies to break template feel)
LABELED_OPENERS = {
    "استخدامات": ["أبرزها", "من أهمّها", "أشهرها", "الأكثر استعمالاً"],
    "استخدامات؟": ["أبرزها", "من أهمّها", "أشهرها"],
    "رئيسية": ["الأبرز", "الأهمّ", "المعتمَدة"],
    "موصى": ["الموصى بها", "الأنسب", "المفضّلة"],
    "قواعد": ["القواعد الأساسية", "المبادئ", "الضوابط الرئيسية"],
    "نصائح": ["أهمّ النصائح", "التوصيات الرئيسية", "الإرشادات المفيدة"],
    "طبقات": ["الطبقات الرئيسية", "المستويات", "المكوّنات"],
    "فئات": ["الفئات الرئيسية", "التصنيفات", "الأقسام"],
    "أدوات": ["الأدوات الأبرز", "أشهرها", "من أهمّها"],
    "خطوات": ["الخطوات الرئيسية", "المراحل", "التسلسل"],
    "أنواع": ["الأنواع الأساسية", "الأشكال", "الأقسام"],
    "نقاط": ["النقاط المهمّة", "أبرزها", "الأهمّ"],
    "أسس": ["الأسس الرئيسية", "المبادئ", "القواعد الأساسية"],
    "أنماط": ["الأنماط الشائعة", "أبرزها", "الأشهر"],
    "مراحل": ["المراحل", "التسلسل", "الخطوات"],
    "عوامل": ["العوامل الأساسية", "أهمّها", "أبرزها"],
    "شروط": ["الشروط الأساسية", "المتطلّبات", "المعايير"],
    "مبادئ": ["المبادئ الأساسية", "الأسس", "القواعد"],
    "أسباب": ["الأسباب الرئيسية", "أبرزها", "أهمّها"],
}
BARE_OPENERS = ["أبرزها", "من أهمّها", "أشهرها", "منها"]

# Deterministic picker so same file always gets same output
def pick(options, seed_str):
    idx = sum(ord(c) for c in seed_str) % len(options)
    return options[idx]


def transform_answer(answer: str, question: str) -> str:
    """Transform numbered opener answer into natural prose."""
    original = answer

    # Try opener with label first
    m = OPENER_WITH_LABEL.match(answer)
    if m:
        label = m.group(1)
        # Normalize label variants (strip question marks etc)
        label_key = label.rstrip("؟?").rstrip("ة") if label.endswith("ة") else label.rstrip("؟?")
        # Try exact match, then base word
        opener_options = LABELED_OPENERS.get(label, None)
        if opener_options is None:
            for k, v in LABELED_OPENERS.items():
                if k.rstrip("ة") == label.rstrip("ة"):
                    opener_options = v
                    break
        if opener_options is None:
            opener_options = BARE_OPENERS
        connector = pick(opener_options, question)
        rest = answer[m.end():]
        # Remove numbered markers (2), (3), (4) etc, replace with "و"
        rest = NUM_MARKER.sub("", rest, count=0)
        # Clean up doubled commas or spaces from removal
        rest = re.sub(r"،\s*،", "،", rest)
        rest = re.sub(r"\s{2,}", " ", rest)
        rest = rest.lstrip("، ").strip()
        return f"{connector}: {rest}"

    # Try bare opener
    m = OPENER_BARE.match(answer)
    if m:
        connector = pick(BARE_OPENERS, question)
        rest = answer[m.end():]
        rest = NUM_MARKER.sub("", rest, count=0)
        rest = re.sub(r"،\s*،", "،", rest)
        rest = re.sub(r"\s{2,}", " ", rest)
        rest = rest.lstrip("، ").strip()
        return f"{connector}: {rest}"

    return original


def process_file(filepath: Path, apply: bool) -> tuple[int, list[tuple[str,str,str]]]:
    text = filepath.read_text(encoding="utf-8")
    fm_match = re.match(r'^(---\r?\n)(.*?)(\r?\n---)', text, re.DOTALL)
    if not fm_match:
        return 0, []
    prefix, fm, suffix = fm_match.groups()
    body = text[fm_match.end():]

    changes = []
    new_fm = fm
    # Find each FAQ answer and possibly rewrite
    def repl(m):
        indent = m.group(1)
        q_text = m.group(2)
        a_text = m.group(3)
        new_a = transform_answer(a_text, q_text)
        if new_a != a_text:
            changes.append((filepath.name, q_text[:60], new_a[:80]))
            return f'{indent}a: "{new_a}"'
        return m.group(0)

    pattern = re.compile(r'(\s+)a:\s*"([^"]*)"', re.MULTILINE)
    # Need question too — use different pattern to capture q then a
    q_a_pattern = re.compile(
        r'^(\s+)- q:\s*"([^"\n]+)"\s*\n\s+a:\s*"([^"\n]+)"',
        re.MULTILINE
    )
    def repl2(m):
        indent = m.group(1)
        q_text = m.group(2)
        a_text = m.group(3)
        new_a = transform_answer(a_text, q_text)
        if new_a != a_text:
            changes.append((filepath.name, q_text[:60], new_a[:80]))
            return f'{indent}- q: "{q_text}"\n{indent}  a: "{new_a}"'
        return m.group(0)

    new_fm = q_a_pattern.sub(repl2, fm)

    if new_fm != fm and apply:
        filepath.write_text(prefix + new_fm + suffix + body, encoding="utf-8")

    return len(changes), changes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--sample", type=int, default=0, help="Show N samples of transformations")
    args = ap.parse_args()

    files = sorted(Path("content/articles").glob("*.mdx"))
    total_changes = 0
    all_changes = []
    for fp in files:
        n, ch = process_file(fp, args.apply)
        total_changes += n
        all_changes.extend(ch)

    print(f"[SUMMARY] {'APPLIED' if args.apply else 'DRY-RUN'}")
    print(f"  Total transformations: {total_changes}")
    print(f"  Files affected: {len({c[0] for c in all_changes})}")

    if args.sample:
        print(f"\n[SAMPLE OF {args.sample} TRANSFORMATIONS]")
        for f, q, a in all_changes[:args.sample]:
            print(f"  {f}")
            print(f"    Q: {q}")
            print(f"    A(new): {a}...")
            print()


if __name__ == "__main__":
    main()
