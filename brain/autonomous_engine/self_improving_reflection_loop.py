#!/usr/bin/env python3
"""
Self-Improving Reflection Loop for Natura Intimo
Inspired by selfimproving-agent/Awesome-Self-Improving-Agents & AFunLS/self-evolving-agent-patterns.

Implements the 4-stage continuous self-evolution loop:
1. OBSERVE: Captures agent output or action
2. EVALUATE / CRITIQUE: Runs an automated 'immune system' check against known edge cases and P0 rules
3. EXTRACT LEARNING: Distills new practical lessons, fit nuances, or technical constraints
4. PERSIST MEMORY: Updates memory/operational_learnings.md and commits with learn(role): convention
"""

import os
import sys
import json
import re
from datetime import datetime, timezone

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LEARNINGS_PATH = os.path.join(WORKSPACE_DIR, "memory", "operational_learnings.md")
BRAFITTING_EDGES = os.path.join(WORKSPACE_DIR, "memory", "brafitting_edge_cases.json")

# Immune System: Blacklists and anti-patterns
FORBIDDEN_CLAIMS = [
    r"\bhandcrafted\b",
    r"\bhandmade\b",
    r"\bmedical grade\b",
    r"\bprevents? (?:back )?pain\b",
    r"\bfor real women\b",
    r"\bgaia nike\b",
    r"\bnike\b"
]

class SelfImprovingEngine:
    def __init__(self):
        self.workspace = WORKSPACE_DIR

    def critique_content(self, text, role="general"):
        """Runs the 'immune system' check to prevent known failure modes."""
        issues = []
        for pat in FORBIDDEN_CLAIMS:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                issues.append(f"FTC / Trademark violation: forbidden term '{m.group(0)}' detected.")
        
        # Check for SB 478 pricing completeness if shipping mentioned
        if "shipping" in text.lower() and not ("24.99" in text or "150" in text or "ddp" in text.lower()):
            issues.append("California SB 478 warning: shipping mentioned without transparent flat rate ($24.99 USD DDP) or free threshold ($150 USD).")

        return {
            "passed": len(issues) == 0,
            "issues": issues
        }

    def record_learning(self, role, title, lesson_text, category="General"):
        """Persists extracted insight into continuous memory and prepares Git commit convention."""
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        entry = f"\n### [{now_str}] {role.upper()}: {title}\n* **Kategoria:** {category}\n* **Wniosek:** {lesson_text}\n"

        if os.path.exists(LEARNINGS_PATH):
            with open(LEARNINGS_PATH, "a", encoding="utf-8") as f:
                f.write(entry)
            print(f"[Self-Improvement] Logged learning for {role} to memory/operational_learnings.md")
        
        commit_msg = f"learn({role}): {title.lower()}"
        print(f"[Self-Improvement] Recommended Git commit: {commit_msg}")
        return commit_msg

if __name__ == "__main__":
    engine = SelfImprovingEngine()
    test_text = "Check our Gorsenia K496 bra with $24.99 DDP flat rate shipping."
    res = engine.critique_content(test_text, "cmo")
    print("Immune System Test Result:", res)
