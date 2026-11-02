"""AI Prompt Response Quality & Factuality Evaluator for DreamCompanion."""

import json
import re
import time
import urllib.request
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

BANNED_ROBOTIC_PATTERNS = [
    r"as an ai (language model)?",
    r"i (do not|don't) have (personal |real )?(feelings|emotions|opinions)",
    r"i am just an ai",
    r"as a machine learning model",
    r"it's important to remember that",
    r"in conclusion",
]


class PromptEvaluator:
    def __init__(self, benchmark_file: Optional[Path] = None):
        if benchmark_file is None:
            benchmark_file = Path(__file__).resolve().parent / "benchmark_suite.json"
        with open(benchmark_file, "r") as f:
            self.test_cases: List[Dict[str, Any]] = json.load(f)

    def evaluate_response(
        self,
        test_case: Dict[str, Any],
        response_text: str,
        latency_s: float,
        provider: str = "unknown"
    ) -> Dict[str, Any]:
        """Evaluate a single AI response against defined quality, persona, and grounding gates."""
        text = (response_text or "").strip()
        lower_text = text.lower()
        words = text.split()
        word_count = len(words)

        # 1. Persona Alignment Check (25 pts)
        persona_terms = [t.lower() for t in test_case.get("required_persona_terms", [])]
        matched_persona_terms = [t for t in persona_terms if t in lower_text]
        persona_score = 100.0 if len(matched_persona_terms) >= 1 else 0.0

        # 2. Grounding & Expected Keywords (35 pts)
        expected_keywords = [k.lower() for k in test_case.get("expected_keywords", [])]
        matched_keywords = [k for k in expected_keywords if k in lower_text]
        min_required = test_case.get("min_keywords_match", 1)
        grounding_score = min(100.0, (len(matched_keywords) / max(min_required, 1)) * 100.0)

        # 3. Conciseness & Formatting (20 pts)
        min_w = test_case.get("min_words", 8)
        max_w = test_case.get("max_words", 140)
        if min_w <= word_count <= max_w:
            length_score = 100.0
        elif word_count < min_w:
            length_score = max(0.0, (word_count / min_w) * 100.0)
        else:
            length_score = max(0.0, 100.0 - (word_count - max_w) * 2.0)

        # 4. Anti-Slop & Zero Robotic Clichés (20 pts)
        slop_detected = []
        for pattern in BANNED_ROBOTIC_PATTERNS:
            if re.search(pattern, lower_text):
                slop_detected.append(pattern)
        anti_slop_score = 0.0 if slop_detected else 100.0

        # Composite Quality Score (0-100)
        composite_score = round(
            (persona_score * 0.25)
            + (grounding_score * 0.35)
            + (length_score * 0.20)
            + (anti_slop_score * 0.20),
            1
        )

        passed = (
            composite_score >= 70.0
            and len(slop_detected) == 0
            and len(matched_keywords) >= min_required
            and latency_s < 6.0
        )

        return {
            "id": test_case["id"],
            "category": test_case["category"],
            "question": test_case["question"],
            "passed": passed,
            "composite_score": composite_score,
            "latency_s": round(latency_s, 2),
            "word_count": word_count,
            "provider": provider,
            "metrics": {
                "persona_score": persona_score,
                "matched_persona_terms": matched_persona_terms,
                "grounding_score": grounding_score,
                "matched_keywords": matched_keywords,
                "expected_keywords": expected_keywords,
                "length_score": length_score,
                "anti_slop_score": anti_slop_score,
                "slop_detected": slop_detected,
            },
            "response": text,
        }

    def run_single_test_local(self, test_case: Dict[str, Any], handler_fn) -> Dict[str, Any]:
        """Run a single test case using the Lambda handler directly."""
        event = {
            "httpMethod": "POST",
            "body": json.dumps({
                "question": test_case["question"],
                "match_context": test_case.get("match_context", ""),
            }),
        }

        start_time = time.time()
        result = handler_fn(event, None)
        latency = time.time() - start_time

        if result.get("statusCode") != 200:
            return {
                "id": test_case["id"],
                "category": test_case["category"],
                "passed": False,
                "composite_score": 0.0,
                "latency_s": round(latency, 2),
                "error": f"HTTP status {result.get('statusCode')}",
                "response": result.get("body", ""),
            }

        body_data = json.loads(result["body"])
        response_text = body_data.get("response", "")
        provider = body_data.get("provider", "unknown")

        return self.evaluate_response(test_case, response_text, latency, provider)

    def run_single_test_live_api(self, test_case: Dict[str, Any], endpoint_url: str) -> Dict[str, Any]:
        """Run a single test case against a live API Gateway URL."""
        payload = {
            "question": test_case["question"],
            "match_context": test_case.get("match_context", ""),
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            endpoint_url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        start_time = time.time()
        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                latency = time.time() - start_time
                body_data = json.loads(resp.read().decode("utf-8"))
                response_text = body_data.get("response", "")
                provider = body_data.get("provider", "live_api")
                return self.evaluate_response(test_case, response_text, latency, provider)
        except Exception as e:
            latency = time.time() - start_time
            return {
                "id": test_case["id"],
                "category": test_case["category"],
                "passed": False,
                "composite_score": 0.0,
                "latency_s": round(latency, 2),
                "error": str(e),
                "response": "",
            }
