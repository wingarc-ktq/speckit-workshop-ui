#!/usr/bin/env python3
"""Re-apply the project's Language Requirement customization to speckit agent files.

speckit の `specify integration install/upgrade` を実行するとエージェント用の
コマンド/スキル/プロンプトファイルが再生成され、独自カスタマイズが失われる。
このスクリプトは frontmatter 直下（gemini の TOML は prompt 本文の先頭）に
下記ブロックを冪等に差し込む。更新のたびに再実行すればよい。

対象:
  - claude  : .claude/skills/speckit-*/SKILL.md
  - cline   : .clinerules/workflows/speckit-*.md
  - copilot : .github/skills/speckit-*/SKILL.md
  - gemini  : .gemini/commands/speckit.*.toml
"""
from __future__ import annotations

import glob
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BLOCK = "## Language Requirement\n\n**ALL outputs MUST be in Japanese.**"
MARKER = "## Language Requirement"

# frontmatter (--- ... ---) を持つ Markdown 系ファイル
MARKDOWN_GLOBS = [
    ".claude/skills/speckit-*/SKILL.md",
    ".clinerules/workflows/speckit-*.md",
    ".github/skills/speckit-*/SKILL.md",
]
# frontmatter を持たない gemini の TOML
TOML_GLOBS = [
    ".gemini/commands/speckit.*.toml",
]


def inject_markdown(text: str) -> str | None:
    if MARKER in text:
        return None  # 既に注入済み
    if not text.startswith("---"):
        return None  # frontmatter なし: 対象外
    end = text.find("\n---", 3)
    if end == -1:
        return None
    fm_end = end + len("\n---")
    head = text[:fm_end]
    rest = text[fm_end:].lstrip("\n")
    return f"{head}\n\n{BLOCK}\n\n{rest}"


def inject_toml(text: str) -> str | None:
    if MARKER in text:
        return None
    anchor = 'prompt = """'
    idx = text.find(anchor)
    if idx == -1:
        return None
    after = idx + len(anchor)
    rest = text[after:].lstrip("\n")
    return f'{text[:after]}\n\n{BLOCK}\n\n{rest}'


def process(globs: list[str], injector) -> None:
    for pattern in globs:
        for path in sorted(glob.glob(os.path.join(REPO_ROOT, pattern))):
            with open(path, encoding="utf-8") as f:
                text = f.read()
            new = injector(text)
            rel = os.path.relpath(path, REPO_ROOT)
            if new is None:
                print(f"skip     {rel}")
                continue
            with open(path, "w", encoding="utf-8") as f:
                f.write(new)
            print(f"injected {rel}")


def main() -> None:
    process(MARKDOWN_GLOBS, inject_markdown)
    process(TOML_GLOBS, inject_toml)


if __name__ == "__main__":
    main()
