#!/usr/bin/env python3
"""
LangGraph Multi-Agent Workflow Router for Natura Intimo
Inspired by langchain-ai/langgraph: Stateful, cyclic multi-agent graph pipelines.

Models e-commerce tasks as state machines with conditional edge transitions:
1. ORDER_FULFILLMENT_GRAPH:
   OrderPlaced -> CustomsHTSClassification -> StockReservation -> CommercialInvoice -> CustomerOnboarding
2. CAMPAIGN_PUBLISHING_GRAPH:
   DraftContent -> ComplianceAudit -> StockAudit -> [Branch: Revise if failed | Branch: Publish if passed] -> AnalyticsMonitor
"""

import json
import sys

class StateGraph:
    def __init__(self, name):
        self.name = name
        self.nodes = {}
        self.edges = {}
        self.conditional_edges = {}

    def add_node(self, node_id, func):
        self.nodes[node_id] = func

    def add_edge(self, from_node, to_node):
        self.edges[from_node] = to_node

    def add_conditional_edge(self, from_node, router_func, path_map):
        self.conditional_edges[from_node] = (router_func, path_map)

    def run(self, initial_state):
        current_node = "START"
        state = initial_state
        print(f"\n[LangGraph: {self.name}] Initiating execution with initial state...")
        
        while current_node != "END":
            if current_node == "START":
                current_node = list(self.nodes.keys())[0]

            node_func = self.nodes.get(current_node)
            print(f"  --> Executing Node: [{current_node}]")
            state = node_func(state)

            if current_node in self.conditional_edges:
                router_func, path_map = self.conditional_edges[current_node]
                decision = router_func(state)
                next_node = path_map.get(decision, "END")
                print(f"      Conditional Edge Branching: decision='{decision}' -> Next: [{next_node}]")
                current_node = next_node
            elif current_node in self.edges:
                current_node = self.edges[current_node]
            else:
                current_node = "END"

        print(f"[LangGraph: {self.name}] Workflow finished successfully.")
        return state

def build_campaign_pipeline():
    graph = StateGraph("CAMPAIGN_PUBLISH_ORCHESTRATOR")

    # Nodes
    def cmo_draft(state):
        state["draft"] = f"Sensual European Support: {state.get('product', 'Gorsenia')} with $24.99 USD DDP shipping."
        state["stage"] = "drafted"
        return state

    def compliance_audit(state):
        draft = state.get("draft", "")
        # Check forbidden words
        if "nike" in draft.lower() or "handcrafted" in draft.lower():
            state["compliance_status"] = "FAIL"
            state["reason"] = "Forbidden claim detected."
        else:
            state["compliance_status"] = "PASS"
        return state

    def merchant_stock_check(state):
        state["stock_available"] = state.get("stock", 100) > 0
        return state

    def publish_content(state):
        state["published"] = True
        state["post_id"] = "META_GRAPH_MOCK_12345"
        return state

    def revision_node(state):
        state["draft"] = state["draft"].replace("Nike", "BS 1135")
        state["revised"] = True
        return state

    graph.add_node("CMO_Draft", cmo_draft)
    graph.add_node("Compliance_Audit", compliance_audit)
    graph.add_node("Merchant_Stock_Check", merchant_stock_check)
    graph.add_node("Publish_Content", publish_content)
    graph.add_node("Revision_Node", revision_node)

    graph.add_edge("CMO_Draft", "Compliance_Audit")
    graph.add_conditional_edge(
        "Compliance_Audit",
        lambda s: s.get("compliance_status"),
        {"PASS": "Merchant_Stock_Check", "FAIL": "Revision_Node"}
    )
    graph.add_edge("Revision_Node", "Compliance_Audit")
    graph.add_conditional_edge(
        "Merchant_Stock_Check",
        lambda s: "PASS" if s.get("stock_available") else "OUT_OF_STOCK",
        {"PASS": "Publish_Content", "OUT_OF_STOCK": "END"}
    )

    return graph

if __name__ == "__main__":
    campaign_graph = build_campaign_pipeline()
    final_state = campaign_graph.run({"product": "Gorsenia K496 Paradise", "stock": 315})
    print("Final State Result:", final_state)
