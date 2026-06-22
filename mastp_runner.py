"""
mastp_runner.py
Main CLI entry point for MASTP MVP.

Usage:
    python mastp_runner.py --module AA
    python mastp_runner.py --module BL --target-tcs 150
    python mastp_runner.py --all-modules

Environment variables required:
    ANTHROPIC_API_KEY   → for Claude Sonnet (primary)
    OPENAI_API_KEY      → for GPT-4o (fallback)
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import time
import uuid
import glob
import re
from datetime import datetime
from pathlib import Path

# ─── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("mastp_output/mastp.log", mode="a", encoding="utf-8"),
    ],
)
logger = logging.getLogger("mastp")

# ─── Module discovery ──────────────────────────────────────────────────────────

def discover_modules(source_root: str = "src/Back_end/src/main/java/com/luxeway") -> dict:
    """Auto-discover all controllers and merge with predefined priorities."""
    predefined = {
        "AA": {"name": "Authentication & Authorization", "controller": "AuthController.java", "priority": "P0", "default_target_tcs": 88},
        "BL": {"name": "Booking Lifecycle", "controller": "BookingController.java", "priority": "P0", "default_target_tcs": 144},
        "PGI": {"name": "Payment Gateway Integration", "controller": "PaymentController.java", "priority": "P0", "default_target_tcs": 112},
        "CM": {"name": "Car Management", "controller": "CarController.java", "priority": "P1", "default_target_tcs": 96},
        "MM": {"name": "Motorbike Management", "controller": "MotorbikeController.java", "priority": "P1", "default_target_tcs": 90},
        "ID": {"name": "Insurance & Deposit", "controller": "InsuranceController.java", "priority": "P1", "default_target_tcs": 48},
        "DC": {"name": "Digital Contract", "controller": "DigitalContractController.java", "priority": "P1", "default_target_tcs": 36},
    }
    
    registry = {}
    for k, v in predefined.items():
        registry[k] = v

    controller_dir = os.path.join(source_root, "controller")
    if not os.path.exists(controller_dir):
        return registry
        
    for file_path in glob.glob(os.path.join(controller_dir, "*Controller.java")):
        filename = os.path.basename(file_path)
        
        # Skip if already in predefined
        if any(pd["controller"] == filename for pd in predefined.values()):
            continue
            
        base_name = filename.replace("Controller.java", "")
        if not base_name: 
            continue
            
        # Generate readable name (e.g., AICopilot -> AI Copilot)
        words = re.findall(r'[A-Z]?[a-z0-9]+|[A-Z]+(?=[A-Z][a-z0-9]|\b)', base_name)
        if not words: words = [base_name]
        
        name = " ".join(w.capitalize() if len(w)>1 else w for w in words)
        
        # Generate module code
        if len(words) == 1:
            code = base_name[:3].upper()
        else:
            code = "".join([w[0].upper() for w in words])
            
        # Handle collisions
        orig_code = code
        counter = 1
        while code in registry:
            code = f"{orig_code}{counter}"
            counter += 1
            
        registry[code] = {
            "name": name,
            "controller": filename,
            "priority": "P2",
            "default_target_tcs": 30, # Default target for auto-discovered modules
        }
        
    return registry

# Initialize with default path, will be updated if user provides --source-root
MODULE_REGISTRY = discover_modules()


def print_banner():
    print("\n" + "═" * 68)
    print("  🤖 MASTP — Multi-Agent Software Testing Platform")
    print("  📦 LuxeWay Vehicle Rental Platform | MVP v1.0")
    print("  🏗️  Pipeline: Code Analysis → Function Inventory → Test Cases")
    print("═" * 68 + "\n")


def run_module(
    module_code: str,
    source_root: str,
    target_tcs: int = None,
    llm_model: str = None,
    base_url: str = "http://localhost:8080",
) -> dict:
    """Run the full MVP pipeline for a single module."""
    from mastp.workflow.graph import build_mvp_graph

    if module_code not in MODULE_REGISTRY:
        raise ValueError(f"Unknown module: {module_code}. Available: {list(MODULE_REGISTRY.keys())}")

    mod_info = MODULE_REGISTRY[module_code]
    target_tcs = target_tcs or mod_info["default_target_tcs"]
    llm_model = llm_model or os.getenv("MASTP_MODEL", "claude-sonnet-4-5")
    session_id = f"mastp-{module_code.lower()}-{uuid.uuid4().hex[:8]}"

    logger.info(f"🚀 Starting session: {session_id}")
    logger.info(f"   Module: {module_code} — {mod_info['name']}")
    logger.info(f"   Target TCs: {target_tcs}")
    logger.info(f"   Model: {llm_model}")
    logger.info(f"   Source: {source_root}")

    # ── Build initial state ───────────────────────────────────────────────
    initial_state = {
        "session_id": session_id,
        "module_code": module_code,
        "module_name": mod_info["name"],
        "controller_file": mod_info["controller"],
        "source_root": source_root,
        "base_url": base_url,
        "target_functions": 15,
        "target_tcs": target_tcs,
        "llm_model": llm_model,
        "source_code": None,
        "endpoints": None,
        "functions": None,
        "test_cases": None,
        "excel_path": None,
        "postman_path": None,
        "quality_scores": {},
        "errors": [],
        "warnings": [],
        "current_node": "init",
        "messages": [],
    }

    # ── Execute graph ─────────────────────────────────────────────────────
    start_time = time.time()
    graph = build_mvp_graph()

    try:
        final_state = graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"❌ Pipeline failed: {e}", exc_info=True)
        return {
            "session_id": session_id,
            "module_code": module_code,
            "module_name": mod_info["name"],
            "status": "failed",
            "error": str(e),
            "elapsed_seconds": 0.0,
            "metrics": {},
            "quality_scores": {},
            "errors": [str(e)],
            "warnings": [],
        }

    elapsed = time.time() - start_time

    # ── Results ────────────────────────────────────────────────────────────
    endpoints = final_state.get("endpoints") or []
    functions = final_state.get("functions") or []
    test_cases = final_state.get("test_cases") or []
    quality_scores = final_state.get("quality_scores", {})
    errors = final_state.get("errors", [])
    warnings = final_state.get("warnings", [])

    result = {
        "session_id": session_id,
        "module_code": module_code,
        "module_name": mod_info["name"],
        "status": "completed" if not errors else "completed_with_errors",
        "elapsed_seconds": round(elapsed, 1),
        "metrics": {
            "endpoints_analyzed": len(endpoints),
            "functions_generated": len(functions),
            "test_cases_generated": len(test_cases),
            "target_tcs": target_tcs,
            "coverage_rate": f"{len(test_cases) / max(target_tcs, 1) * 100:.1f}%",
        },
        "quality_scores": quality_scores,
        "artifacts": {
            "excel": final_state.get("excel_path", "N/A"),
        },
        "errors": errors,
        "warnings": warnings,
    }

    return result


def print_results(result: dict):
    """Print a formatted results summary."""
    print("\n" + "─" * 68)
    print(f"  📊 RESULTS — {result['module_code']}: {result['module_name']}")
    print("─" * 68)

    metrics = result.get("metrics", {})
    print(f"  ✅ Status:       {result['status']}")
    print(f"  ⏱️  Duration:     {result['elapsed_seconds']}s")
    print(f"  🔍 Endpoints:    {metrics.get('endpoints_analyzed', 0)}")
    print(f"  📦 Functions:    {metrics.get('functions_generated', 0)}")
    print(f"  📝 Test Cases:   {metrics.get('test_cases_generated', 0)} / {metrics.get('target_tcs', '?')}")
    print(f"  📈 Coverage:     {metrics.get('coverage_rate', '?')}")

    scores = result.get("quality_scores", {})
    print(f"\n  Quality Scores:")
    for agent, score in scores.items():
        bar = "█" * int(score * 20) + "░" * (20 - int(score * 20))
        print(f"    {agent:<25} {bar} {score:.2f}")

    artifacts = result.get("artifacts", {})
    if artifacts.get("excel") and artifacts["excel"] != "N/A":
        print(f"\n  💾 Excel output: {artifacts['excel']}")

    if result.get("errors"):
        print(f"\n  ❌ Errors ({len(result['errors'])}):")
        for err in result["errors"]:
            print(f"    • {err}")

    if result.get("warnings"):
        print(f"\n  ⚠️  Warnings ({len(result['warnings'])}):")
        for w in result["warnings"]:
            print(f"    • {w}")

    print("─" * 68 + "\n")


def main():
    # ── Load .env if available ────────────────────────────────────────────
    env_file = Path(".env")
    if env_file.exists():
        from dotenv import load_dotenv
        load_dotenv()
        logger.info("✓ Loaded .env file")

    # ── Validate API keys ─────────────────────────────────────────────────
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")
    if not anthropic_key and not openai_key:
        print("❌ ERROR: No LLM API key found.")
        print("   Set ANTHROPIC_API_KEY or OPENAI_API_KEY in environment or .env file.")
        sys.exit(1)

    # ── Parse arguments ────────────────────────────────────────────────────
    parser = argparse.ArgumentParser(
        description="MASTP MVP — Multi-Agent Software Testing Platform for LuxeWay",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python mastp_runner.py --module AA
  python mastp_runner.py --module BL --target-tcs 150
  python mastp_runner.py --all-modules
  python mastp_runner.py --module PGI --model gpt-4o
        """
    )
    parser.add_argument(
        "--module", "-m",
        help="Module code to process (e.g., AA, BL, PGI)"
    )
    parser.add_argument(
        "--all-modules", "-a",
        action="store_true",
        help="Process all 7 priority modules sequentially"
    )
    parser.add_argument(
        "--source-root", "-s",
        default="src/Back_end/src/main/java/com/luxeway",
        help="Path to Java source root (default: src/Back_end/src/main/java/com/luxeway)"
    )
    parser.add_argument(
        "--base-url", "-u",
        default="http://localhost:8080",
        help="Backend base URL for API tests"
    )
    parser.add_argument(
        "--target-tcs", "-t",
        type=int,
        default=None,
        help="Target number of test cases to generate"
    )
    parser.add_argument(
        "--model",
        default=None,
        help="LLM model to use (default: claude-sonnet-4-5)"
    )

    args = parser.parse_args()

    # Re-discover modules if custom source root provided
    if args.source_root != "src/Back_end/src/main/java/com/luxeway":
        MODULE_REGISTRY.clear()
        MODULE_REGISTRY.update(discover_modules(args.source_root))

    if not args.module and not args.all_modules:
        print("Available modules discovered in backend:")
        for code, info in sorted(MODULE_REGISTRY.items()):
            print(f"  {code:<6} | {info['name']:<35} | {info['controller']}")
        print("\nRun with --module <CODE> or --all-modules")
        sys.exit(1)

    # ── Output directory ───────────────────────────────────────────────────
    os.makedirs("mastp_output", exist_ok=True)

    print_banner()

    # ── Resolve source root ────────────────────────────────────────────────
    source_root = os.path.abspath(args.source_root)
    if not os.path.exists(source_root):
        print(f"❌ ERROR: Source root not found: {source_root}")
        sys.exit(1)

    # ── Run pipeline ───────────────────────────────────────────────────────
    modules_to_run = list(MODULE_REGISTRY.keys()) if args.all_modules else [args.module]
    all_results = []

    for module_code in modules_to_run:
        # Resume capability: skip if already successfully generated WITH test cases
        expected_excel = f"mastp_output/TC_{module_code}_*.xlsx"
        result_json = f"mastp_output/result_{module_code}.json"
        existing_excel = glob.glob(expected_excel)
        
        should_skip = False
        if existing_excel and os.path.exists(result_json):
            with open(result_json, "r", encoding="utf-8") as f:
                try:
                    past_result = json.load(f)
                    tc_count = past_result.get("metrics", {}).get("test_cases_generated", 0)
                    # Chỉ skip khi status completed VÀ tạo ra số test_case > 0
                    if past_result.get("status") == "completed" and tc_count > 0:
                        should_skip = True
                except:
                    pass
                    
        if should_skip:
            print(f"\n⏭️  Skipping {module_code}: Đã tạo thành công {tc_count} Test Cases")
            continue

        print(f"\n{'─'*68}")
        print(f"  🔄 Processing: {module_code} — {MODULE_REGISTRY[module_code]['name']}")
        print(f"{'─'*68}")

        result = run_module(
            module_code=module_code,
            source_root=source_root,
            target_tcs=args.target_tcs,
            llm_model=args.model,
            base_url=args.base_url,
        )
        print_results(result)
        all_results.append(result)

        # Save individual result JSON
        result_path = f"mastp_output/result_{module_code}.json"
        with open(result_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
            
        # Pause to respect API Rate Limits (Tokens Per Minute)
        if len(modules_to_run) > 1 and result.get("status") != "failed":
            print(f"  ⏳ Pausing for 10s to respect API Rate Limits...")
            time.sleep(10)

    # ── Grand summary for multi-module run ────────────────────────────────
    if len(all_results) > 1:
        total_functions = sum(r["metrics"]["functions_generated"] for r in all_results)
        total_tcs = sum(r["metrics"]["test_cases_generated"] for r in all_results)
        total_time = sum(r["elapsed_seconds"] for r in all_results)

        print("\n" + "═" * 68)
        print("  🏆 GRAND TOTAL — All Modules")
        print("═" * 68)
        print(f"  Total Functions : {total_functions}")
        print(f"  Total Test Cases: {total_tcs}")
        print(f"  Total Duration  : {total_time:.1f}s ({total_time/60:.1f} min)")
        print(f"  Excel files     : mastp_output/TC_*.xlsx")
        print("═" * 68 + "\n")

        # Save summary JSON
        summary = {
            "generated_at": datetime.now().isoformat(),
            "total_functions": total_functions,
            "total_test_cases": total_tcs,
            "modules": all_results,
        }
        with open("mastp_output/summary.json", "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        print(f"  📄 Summary saved to mastp_output/summary.json")

    print("\n✅ MASTP MVP run complete!\n")


if __name__ == "__main__":
    main()
