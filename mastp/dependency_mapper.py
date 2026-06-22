"""
mastp/dependency_mapper.py
Dependency Graph Agent — reads all result_*.json files and builds a
cross-module dependency graph. Run AFTER modules have been analyzed.

Usage:
    python -m mastp.dependency_mapper
    python -m mastp.dependency_mapper --output mastp_output/dep_graph.json
"""

import json
import glob
import argparse
from pathlib import Path
from collections import defaultdict
from datetime import datetime


def load_all_results(output_dir: str = "mastp_output") -> list[dict]:
    """Load every result_*.json produced by mastp_runner."""
    results = []
    for path in sorted(glob.glob(f"{output_dir}/result_*.json")):
        try:
            with open(path, "r", encoding="utf-8") as f:
                results.append(json.load(f))
        except Exception as e:
            print(f"  ⚠ Skipped {path}: {e}")
    return results


def extract_dependencies_from_result(result: dict) -> dict:
    """
    Extract dependency data from a single module result.
    Reads the functions list if embedded, or falls back to raw state data.
    """
    module_code = result.get("module_code", "?")
    # Try to find functions with dependency info in artifacts or raw state
    # The functions were extracted in the workflow state — look inside result artifacts
    # For now, parse from the metrics/artifacts section
    artifacts = result.get("artifacts", {})
    functions = result.get("functions", [])          # populated in Phase 2
    endpoints = result.get("endpoints", [])          # populated by Code Analysis

    deps_from_functions = []
    for func in functions:
        deps_from_functions.extend(func.get("dependencies", []))
    for ep in endpoints:
        deps_from_functions.extend(ep.get("dependencies", []))

    return {
        "module_code": module_code,
        "module_name": result.get("module_name", "?"),
        "dependencies": list(set(deps_from_functions)),
    }


def build_service_graph(module_deps: list[dict]) -> dict:
    """
    Build an inverted service dependency graph.
    Shows: ServiceX → [list of modules that use it]
    And:   ModuleX  → [list of services it uses]
    """
    service_to_modules: dict[str, list[str]] = defaultdict(list)
    module_to_services: dict[str, list[str]] = {}

    for m in module_deps:
        code = m["module_code"]
        deps = m["dependencies"]
        module_to_services[code] = deps
        for svc in deps:
            service_to_modules[svc].append(code)

    return {
        "module_to_services": module_to_services,
        "service_to_modules": dict(service_to_modules),
    }


def identify_hotspots(graph: dict, top_n: int = 10) -> list[dict]:
    """
    Identify high-risk services used by many modules.
    These are integration test hotspots and regression risk zones.
    """
    service_to_modules = graph.get("service_to_modules", {})
    hotspots = [
        {
            "service": svc,
            "used_by_count": len(modules),
            "used_by_modules": modules,
            "risk_tier": (
                "Critical" if len(modules) >= 5 else
                "High"     if len(modules) >= 3 else
                "Medium"
            ),
        }
        for svc, modules in service_to_modules.items()
    ]
    return sorted(hotspots, key=lambda x: x["used_by_count"], reverse=True)[:top_n]


def generate_integration_candidates(graph: dict) -> list[dict]:
    """
    Suggest cross-module integration test pairs based on shared services.
    Major Issue #4 fix: provides input for future Integration Test Generator.
    """
    service_to_modules = graph.get("service_to_modules", {})
    candidates = []

    for svc, modules in service_to_modules.items():
        if len(modules) >= 2:
            for i in range(len(modules)):
                for j in range(i + 1, len(modules)):
                    candidates.append({
                        "shared_service": svc,
                        "module_a":       modules[i],
                        "module_b":       modules[j],
                        "integration_scenario": (
                            f"Test {modules[i]} → {svc} → {modules[j]} data flow"
                        ),
                    })
    return candidates


def main():
    parser = argparse.ArgumentParser(description="MASTP Dependency Graph Mapper")
    parser.add_argument("--input-dir", default="mastp_output", help="Directory with result_*.json files")
    parser.add_argument("--output",    default="mastp_output/dep_graph.json", help="Output path for graph JSON")
    args = parser.parse_args()

    print("\n" + "═" * 60)
    print("  🗺️  MASTP — Dependency Graph Mapper")
    print("═" * 60)

    results = load_all_results(args.input_dir)
    if not results:
        print(f"  ❌ No result_*.json files found in {args.input_dir}")
        print("     Run mastp_runner.py first to generate module results.")
        return

    print(f"  📂 Loaded {len(results)} module result(s)")

    module_deps = [extract_dependencies_from_result(r) for r in results]
    graph = build_service_graph(module_deps)
    hotspots = identify_hotspots(graph)
    integration_candidates = generate_integration_candidates(graph)

    output = {
        "generated_at":            datetime.now().isoformat(),
        "modules_analyzed":        len(results),
        "graph":                   graph,
        "hotspots":                hotspots,
        "integration_candidates":  integration_candidates[:20],  # Top 20
        "note": (
            "Phase 2: BR Agent will enrich 'graph' with service-level business rules. "
            "Phase 3: Integration Test Generator reads 'integration_candidates'."
        ),
    }

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Print summary
    print(f"\n  🔗 Dependency Graph:")
    print(f"     Modules with extracted deps : {len([m for m in module_deps if m['dependencies']])}")
    print(f"     Unique services found       : {len(graph['service_to_modules'])}")
    print(f"     Integration test candidates : {len(integration_candidates)}")

    if hotspots:
        print(f"\n  🔥 Top Hotspot Services (High-Risk Integration Points):")
        for h in hotspots[:5]:
            print(f"     [{h['risk_tier']:8}] {h['service']:<35} used by {h['used_by_count']} modules: {h['used_by_modules']}")

    print(f"\n  ✅ Dependency graph saved → {args.output}")
    print("═" * 60 + "\n")


if __name__ == "__main__":
    main()
