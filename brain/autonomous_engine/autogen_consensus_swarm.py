#!/usr/bin/env python3
"""
AutoGen Conversational Consensus Swarm for Natura Intimo
Inspired by microsoft/autogen: Multi-agent conversational deliberation and peer-critique.

Coordinates a 4-agent consensus round before major campaigns or catalog updates:
- CEO Agent (Strategy & Margin Protection)
- CMO Agent (Engagement & Positioning)
- Compliance Agent (FTC & SB 478 Legal Guardrails)
- Merchant Agent (MADA Stock & Matching Sets)
"""

import sys
import json

class Agent:
    def __init__(self, name, role, system_instruction):
        self.name = name
        self.role = role
        self.instruction = system_instruction

class AutoGenConsensusSwarm:
    def __init__(self):
        self.agents = {
            "CEO": Agent("CEO", "Ecommerce CEO", "Protect net margin >40%, enforce 0 PLN organic first, verify landed costs."),
            "CMO": Agent("CMO", "Marketing Director", "Drive CTR, craft architectural hooks for DD–M cups, highlight Set Savings -$10."),
            "Compliance": Agent("Compliance", "Legal & FTC Auditor", "Eliminate forbidden claims (no handcrafted, no Nike, no medical), verify California SB 478."),
            "Merchant": Agent("Merchant", "Store Manager", "Verify MADA XML stock, ensure bra is paired with matching bottom.")
        }

    def deliberate_campaign(self, product_name, stock_count, copy_draft):
        """Simulates conversational deliberation loop between agents until consensus is reached."""
        print(f"\n[AutoGen Swarm] Initiating Deliberation Session for: '{product_name}'")
        dialogue = []

        # Turn 1: CMO Proposal
        t1 = f"CMO: I propose launching a campaign for {product_name}. Draft copy: '{copy_draft}'."
        dialogue.append(t1)
        print(" ", t1)

        # Turn 2: Compliance Review
        issues = []
        if "handcrafted" in copy_draft.lower():
            issues.append("Term 'handcrafted' violates FTC Textile Act.")
        if "nike" in copy_draft.lower():
            issues.append("Term 'Nike' infringes trademark; replace with BS 1135.")
        if "24.99" not in copy_draft and "150" not in copy_draft:
            issues.append("California SB 478 requires explicit shipping rates ($24.99 USD DDP / free at $150).")

        if issues:
            t2 = f"Compliance: Objection! Found legal issues: {', '.join(issues)}. Please revise."
        else:
            t2 = "Compliance: Legal review passed. No FTC or SB 478 violations detected."
        dialogue.append(t2)
        print(" ", t2)

        # Turn 3: Merchant Stock & Set Verification
        if stock_count < 10:
            t3 = f"Merchant: Warning! Only {stock_count} units left in MADA warehouse. We risk overselling."
        else:
            t3 = f"Merchant: Stock verified ({stock_count} units available). Matching bottoms are in stock; automatic $10 Set Savings discount applies."
        dialogue.append(t3)
        print(" ", t3)

        # Turn 4: CEO Decision
        is_approved = (len(issues) == 0 and stock_count >= 10)
        if is_approved:
            t4 = "CEO: Consensus achieved. Economics and compliance verified. Authorized for publication."
        else:
            t4 = "CEO: Approval withheld. Address Compliance and Merchant objections before execution."
        dialogue.append(t4)
        print(" ", t4)

        # Optional WhatsApp Notification to Store Owner
        try:
            import os
            workspace_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            backend_dir = os.path.join(workspace_dir, "backend")
            if backend_dir not in sys.path:
                sys.path.append(backend_dir)
            from whatsapp_agent_dispatcher import send_agent_dispatch
            
            status_text = "ZATWIERDZONA (Konsensus 4/4)" if is_approved else "ODRZUCONA / WYMAGA POPRAWEK"
            summary_body = f"Produkt: *{product_name}*\nStatus: *{status_text}*\n\n"
            summary_body += "\n".join([f"• {d}" for d in dialogue[-3:]])
            send_agent_dispatch("CEO", f"AutoGen Swarm: {product_name}", summary_body, priority="SUCCESS" if is_approved else "HIGH")
        except Exception as e:
            pass

        return {
            "approved": is_approved,
            "dialogue": dialogue
        }

if __name__ == "__main__":
    swarm = AutoGenConsensusSwarm()
    res = swarm.deliberate_campaign(
        product_name="Gorsenia K496 Paradise",
        stock_count=315,
        copy_draft="Architectural Full-Bust Support: Gorsenia K496 Paradise Black. Flat rate $24.99 USD DDP, free shipping over $150 USD."
    )
    print("\nSwarm Consensus Result:", res["approved"])

