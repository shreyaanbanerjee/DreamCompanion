"""AWS Lambda Handler for 'Ask Corner' AI Chat with CSK Fan Lore Pack."""

import json
import os
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, Tuple

from fan_lore import build_system_prompt

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json",
}

# Current supported Gemini models in order of priority
GEMINI_MODELS = [
    "models/gemini-3.5-flash",
    "models/gemini-3.8-flash",
    "models/gemini-flash-latest",
    "models/gemini-2.5-flash",
]


def generate_fallback_fan_response(question: str, match_context: str = "") -> str:
    """Generate intelligent contextual response using Fan Lore Pack when no LLM API key is present."""
    q_lower = question.lower().strip()

    # Friendly greeting handling
    if q_lower in ["hi", "hello", "hey", "vanakkam", "sup", "yo", "hi!", "hello!", "hey there"]:
        return (
            "Vanakkam! Welcome to the CSK Corner. Ask me anything about this thrilling IPL final chase, "
            "Dhoni's tactics, or Sir Jadeja's chances! Whistle Podu!"
        )

    if any(k in q_lower for k in ["dhoni", "thala", "captain", "knee", "duck"]):
        return (
            "Thala MS Dhoni's presence alone anchors this team. Even with his heavily strapped knee and "
            "that heart-wrenching golden duck, his tactical clarity from the dugout never wavers. As Thala always says, "
            "'Take the game deep, the bowler feels the pressure more than you.' Whistle Podu!"
        )
    elif any(k in q_lower for k in ["jadeja", "sir", "jaddu", "sword", "finish", "10 off 2"]):
        return (
            "Never doubt Sir Ravindra Jadeja! He's the ultimate clutch warrior. Needing 10 off 2 balls with Mohit "
            "firing yorkers is where legends are forged. Look for the straight drive or the fine tickle past short fine leg. "
            "Get the swords ready!"
        )
    elif any(k in q_lower for k in ["rayudu", "retirement", "swansong"]):
        return (
            "Rayudu's 6, 4, 6 off Mohit Sharma in the 13th over was pure championship grit! To play that fearless "
            "cameo in his final IPL match shows why he is a true CSK warrior."
        )
    elif any(k in q_lower for k in ["dube", "spin", "six"]):
        return (
            "Shivam Dube has been our spin enforcer all season long. His long levers and ability to hit down the ground "
            "kept us in the hunt through the middle overs."
        )
    elif any(k in q_lower for k in ["mohit", "sharma", "bowler", "yorker", "over"]):
        return (
            "Mohit Sharma has bowled his heart out nailing blockhole yorkers. But death overs in a rain-curtailed final "
            "leave zero margin for error. One loose length ball and Chepauk's energy in Ahmedabad takes over!"
        )
    elif any(k in q_lower for k in ["run rate", "rrr", "crr", "target", "overs", "equation", "need"]):
        return (
            f"With the DLS target of 171 in 15 overs, every single ball is worth gold! "
            f"{f'Current situation: {match_context}. ' if match_context else ''}"
            "The equation is brutally simple: hit the boundaries, hold your nerve, and back the Yellow jersey!"
        )
    else:
        return (
            f"CSK in an IPL Final is pure theater! {f'With {match_context}, ' if match_context else ''}"
            "Every ball has 100,000 heartbeats pulsing in unison. As long as we believe and back each delivery, "
            "the trophy is coming back to Anbuden. Whistle Podu!"
        )


def call_anthropic_api(api_key: str, system_prompt: str, user_prompt: str) -> Optional[str]:
    """Call Anthropic Claude API via standard urllib."""
    url = "https://api.anthropic.com/v1/messages"
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 300,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        content = result.get("content", [])
        if content and "text" in content[0]:
            return content[0]["text"].strip()
    return None


def call_gemini_api(api_key: str, system_prompt: str, user_prompt: str) -> Optional[Tuple[str, str]]:
    """Call Google Gemini API trying active supported models."""
    for model_name in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={api_key}"
        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"parts": [{"text": user_prompt}]}],
            "generationConfig": {"maxOutputTokens": 300, "temperature": 0.7},
        }
        headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        short_model = model_name.replace("models/", "")
                        return parts[0]["text"].strip(), short_model
        except Exception:
            continue
    return None


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main AWS Lambda handler for API Gateway."""
    http_method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "GET")

    if http_method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"status": "preflight_ok"}),
        }

    raw_body = event.get("body")
    if not raw_body:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": False, "error": "Missing request body"}),
        }

    if event.get("isBase64Encoded", False):
        import base64
        raw_body = base64.b64decode(raw_body).decode("utf-8")

    try:
        body_data = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
    except Exception as e:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": False, "error": f"Invalid JSON: {str(e)}"}),
        }

    question = body_data.get("question", "").strip()
    if not question:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": False, "error": "'question' field cannot be empty"}),
        }

    match_context = body_data.get("match_context", "")
    system_prompt = build_system_prompt(str(match_context))

    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

    # Treat dummy placeholders and ellipses as unset
    if anthropic_key and (anthropic_key.endswith("...") or "your" in anthropic_key.lower() or len(anthropic_key) < 20):
        anthropic_key = None
    if gemini_key and (gemini_key.endswith("...") or "your" in gemini_key.lower() or len(gemini_key) < 20):
        gemini_key = None

    ai_response = None
    provider = "fallback"

    if anthropic_key:
        try:
            ai_response = call_anthropic_api(anthropic_key, system_prompt, question)
            if ai_response:
                provider = "anthropic"
        except Exception:
            ai_response = None

    if not ai_response and gemini_key:
        try:
            gemini_res = call_gemini_api(gemini_key, system_prompt, question)
            if gemini_res:
                ai_response, model_used = gemini_res
                provider = f"gemini ({model_used})"
        except Exception:
            ai_response = None

    if not ai_response:
        ai_response = generate_fallback_fan_response(question, match_context)
        provider = "fan_lore_engine"

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({
            "success": True,
            "response": ai_response,
            "provider": provider,
            "persona": "CSK Corner Companion",
        }),
    }
