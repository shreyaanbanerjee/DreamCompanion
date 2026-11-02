"""Automated Pytest Suite for AI Prompt Response Quality & Factuality."""

import json
from pathlib import Path
import pytest

from ai_eval.evaluator import PromptEvaluator
from handler import lambda_handler

evaluator = PromptEvaluator()


@pytest.mark.parametrize("test_case", evaluator.test_cases, ids=[c["id"] for c in evaluator.test_cases])
def test_prompt_response_quality(test_case):
    """Evaluate each benchmark fan prompt against persona, factual grounding, and conciseness."""
    result = evaluator.run_single_test_local(test_case, lambda_handler)

    assert result["passed"] is True, (
        f"Prompt test '{test_case['id']}' failed assertions.\n"
        f"Question: {test_case['question']}\n"
        f"Score: {result.get('composite_score', 0)}%\n"
        f"Response: {result.get('response', '')}\n"
        f"Matched Keywords: {result.get('metrics', {}).get('matched_keywords')}\n"
        f"Expected Keywords: {result.get('metrics', {}).get('expected_keywords')}\n"
        f"Slop Detected: {result.get('metrics', {}).get('slop_detected')}"
    )

    assert result["composite_score"] >= 70.0
    assert len(result["metrics"]["slop_detected"]) == 0
    assert result["latency_s"] < 6.0
