#!/usr/bin/env python3
"""
AI Prompt Quality & Response Factuality Evaluation Pipeline.

Evaluates DreamCompanion 'Ask Corner' AI prompts against benchmark test cases,
measuring persona alignment, factual lore accuracy, conciseness, latency,
and absence of robotic AI cliches.

Usage:
    python scripts/evaluate_ai_prompts.py           # Runs locally using Lambda handler + .env
    python scripts/evaluate_ai_prompts.py --live    # Evaluates against live AWS API Gateway
    python scripts/evaluate_ai_prompts.py --save    # Saves report to ai_eval_report.json
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

# Add project root and lambda directory to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
LAMBDA_DIR = PROJECT_ROOT / "lambda_ask_corner"
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(LAMBDA_DIR))

try:
    from dotenv import load_dotenv
    load_dotenv(PROJECT_ROOT / ".env")
except ImportError:
    pass

from ai_eval.evaluator import PromptEvaluator
from handler import lambda_handler

LIVE_API_ENDPOINT = "https://2w9xgvn0hi.execute-api.us-east-1.amazonaws.com/ask"


def print_banner():
    print("\n" + "=" * 80)
    print(" 🏏 DREAMCOMPANION AI PROMPT EVALUATION PIPELINE")
    print(" Evaluating persona consistency, factual grounding, and conciseness")
    print("=" * 80 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Run AI prompt evaluation pipeline")
    parser.add_argument("--live", action="store_true", help="Evaluate against live AWS API Gateway endpoint")
    parser.add_argument("--save", action="store_true", help="Save results to ai_eval_report.json")
    parser.add_argument("--endpoint", default=LIVE_API_ENDPOINT, help="Custom API Gateway endpoint URL")
    args = parser.parse_args()

    print_banner()

    evaluator = PromptEvaluator()
    total_tests = len(evaluator.test_cases)
    mode_str = f"Live AWS API Gateway ({args.endpoint})" if args.live else "Local Lambda Handler (Gemini / Fan Lore Engine)"
    print(f"Target Mode   : {mode_str}")
    print(f"Benchmark Size: {total_tests} test cases\n")

    results = []
    start_all = time.time()

    # Column header
    print(f"{'STATUS':<8} | {'CATEGORY':<25} | {'SCORE':<7} | {'LATENCY':<8} | {'WORDS':<6} | {'ID'}")
    print("-" * 80)

    for case in evaluator.test_cases:
        if args.live:
            res = evaluator.run_single_test_live_api(case, args.endpoint)
        else:
            res = evaluator.run_single_test_local(case, lambda_handler)

        results.append(res)
        status_badge = "✓ PASS" if res["passed"] else "✗ FAIL"
        score_str = f"{res.get('composite_score', 0):.1f}%"
        latency_str = f"{res.get('latency_s', 0):.2f}s"
        words_str = f"{res.get('word_count', 0)}"
        cat_str = case["category"][:25]
        test_id = case["id"]

        print(f"{status_badge:<8} | {cat_str:<25} | {score_str:<7} | {latency_str:<8} | {words_str:<6} | {test_id}")

    total_time = time.time() - start_all
    passed_count = sum(1 for r in results if r["passed"])
    failed_count = total_tests - passed_count
    pass_rate = (passed_count / total_tests) * 100.0
    avg_score = sum(r.get("composite_score", 0) for r in results) / total_tests
    avg_latency = sum(r.get("latency_s", 0) for r in results) / total_tests

    print("\n" + "=" * 80)
    print(" EVALUATION RESULTS SUMMARY")
    print("=" * 80)
    print(f" Total Tests   : {total_tests}")
    print(f" Passed        : {passed_count}")
    print(f" Failed        : {failed_count}")
    print(f" Pass Rate     : {pass_rate:.1f}%")
    print(f" Average Score : {avg_score:.1f}%")
    print(f" Avg Latency   : {avg_latency:.2f}s")
    print(f" Pipeline Time : {total_time:.2f}s")
    print("=" * 80)

    if args.save:
        report_path = PROJECT_ROOT / "ai_eval_report.json"
        report_data = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "mode": "live_api" if args.live else "local",
            "total_tests": total_tests,
            "passed": passed_count,
            "failed": failed_count,
            "pass_rate_pct": round(pass_rate, 1),
            "average_score": round(avg_score, 1),
            "average_latency_s": round(avg_latency, 2),
            "results": results,
        }
        with open(report_path, "w") as f:
            json.dump(report_data, f, indent=2)
        print(f"\n📄 Saved evaluation report to: {report_path.relative_to(PROJECT_ROOT)}")

    if failed_count > 0:
        print("\n❌ AI Evaluation Failed: One or more prompt test cases failed quality assertions.\n")
        sys.exit(1)
    else:
        print("\n✅ AI Evaluation Passed: All responses met persona, grounding, and quality standards!\n")
        sys.exit(0)


if __name__ == "__main__":
    main()

