import os
import json
import glob

def generate_aggregated_coverage():
    output_dir = "mastp_output"
    coverage_files = glob.glob(os.path.join(output_dir, "coverage_*.json"))
    
    if not coverage_files:
        print("No coverage reports found in mastp_output/")
        return

    total_br = 0
    covered_br = 0
    duplicate_br_count = 0
    low_quality_tc_count = 0
    modules_count = len(coverage_files)
    
    # To track all uncovered rules across all modules
    all_uncovered_rules = []

    for file_path in coverage_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                report = json.load(f)
                
            cov = report.get("coverage", {})
            gaps = report.get("gaps", {})
            
            total_br += cov.get("total_rules_after_dedup", 0)
            covered_br += cov.get("covered_business_rules", 0)
            duplicate_br_count += cov.get("duplicate_rules_removed", 0)
            low_quality_tc_count += cov.get("low_quality_tc_count", 0)
            
            module_uncovered = gaps.get("uncovered_rules", [])
            all_uncovered_rules.extend(module_uncovered)
            
            print(f"Module: {report.get('module_code')}")
            print(f"  Total BRs: {cov.get('total_rules_after_dedup', 0)}")
            print(f"  Covered BRs: {cov.get('covered_business_rules', 0)}")
            pct = 0.0
            if cov.get('total_rules_after_dedup', 0) > 0:
                pct = (cov.get('covered_business_rules', 0) / cov.get('total_rules_after_dedup', 1)) * 100
            print(f"  Coverage: {pct:.1f}%")
            if module_uncovered:
                print(f"  Uncovered: {', '.join(module_uncovered)}")
            print("-" * 40)
            
        except Exception as e:
            print(f"Failed to read {file_path}: {e}")

    coverage_percent = 0.0
    if total_br > 0:
        coverage_percent = (covered_br / total_br) * 100

    aggregated_report = {
        "modules": modules_count,
        "total_br": total_br,
        "covered_br": covered_br,
        "coverage_percent": round(coverage_percent, 1),
        "diagnostics": {
            "duplicate_br_count": duplicate_br_count,
            "duplicate_tc_count": 0, # Cannot accurately compute across modules without reading xlsx
            "low_quality_tc_count": low_quality_tc_count,
            "uncovered_rules": all_uncovered_rules
        }
    }

    print("\n" + "=" * 40)
    print("AGGREGATED COVERAGE REPORT")
    print("=" * 40)
    print(json.dumps(aggregated_report, indent=2))
    
    out_path = os.path.join(output_dir, "aggregated_coverage.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(aggregated_report, f, indent=2)
    print(f"\nSaved aggregated report to {out_path}")

if __name__ == "__main__":
    generate_aggregated_coverage()
