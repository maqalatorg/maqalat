#!/usr/bin/env python3
"""Extract all FAQ answers that open with a number word."""
import re, sys, glob, json
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

NUMBERED = {"خمسة","ستة","ستّة","أربعة","سبعة","ثلاثة","ثلاث","أربع","خمس","ست","سبع","اثنان","اثنتان","تسعة","عشرة"}

def extract_faqs(text):
    """Return list of (q, a, a_start_pos) tuples from YAML."""
    fm_match = re.match(r'^---\r?\n(.*?)\r?\n---', text, re.DOTALL)
    if not fm_match: return []
    fm = fm_match.group(1)
    faqs = []
    for m in re.finditer(r'^\s+- q:\s*"([^"]+)"\s*\n\s+a:\s*"([^"]+)"', fm, re.MULTILINE):
        faqs.append((m.group(1), m.group(2)))
    return faqs

def opens_numbered(answer):
    first_words = answer.strip().split()[:3]
    for w in first_words:
        clean = w.strip("،.!?:؛()،")
        if clean in NUMBERED:
            return True
    return False

results = {}
for fp in sorted(glob.glob("content/articles/*.mdx")):
    text = open(fp, encoding="utf-8").read()
    faqs = extract_faqs(text)
    hits = [(q, a) for q, a in faqs if opens_numbered(a)]
    if hits:
        results[fp.replace("\\","/")] = hits

# Print summary
total = sum(len(v) for v in results.values())
print(f"[SUMMARY] {total} numbered-FAQ answers across {len(results)} files\n")
for f, hits in sorted(results.items(), key=lambda x: -len(x[1]))[:30]:
    print(f"[{len(hits)}] {f}")
    for q, a in hits:
        print(f"    Q: {q[:80]}")
        print(f"    A: {a[:100]}...")

with open("scripts/faq_targets.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"\n[JSON] scripts/faq_targets.json")
