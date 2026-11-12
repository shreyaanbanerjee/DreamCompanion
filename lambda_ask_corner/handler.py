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

    # What-if tactical scenarios
    if any(k in q_lower for k in ["what if", "scenario"]):
        if any(k in q_lower for k in ["single", "9 off", "9 runs"]):
            return (
                "If Jadeja had taken a single on 14.5, Shivam Dube would have needed 9 runs off 1 ball—which is "
                "mathematically impossible without a no-ball! Jadeja knew he had to hit a six or boundary. "
                "That straight six kept CSK in the fight! Whistle Podu!"
            )
        if any(k in q_lower for k in ["shami"]):
            return (
                "If Shami had bowled the 15th over, his pace and seam presentation would have tested the batsmen, "
                "but he had already bowled out. Hardik Pandya backed Mohit's yorkers—which worked for 4 balls until "
                "Sir Jadeja created magic! Whistle Podu!"
            )
        if any(k in q_lower for k in ["rain", "washout", "washed"]):
            return (
                "If rain had washed out the reserve day before 5 overs of the chase, GT would have taken the trophy "
                "by finishing top of the league table. Massive credit to the Narendra Modi Stadium groundsmen for giving "
                "us a thrilling 15-over finish! Whistle Podu!"
            )
        return (
            "In a final-over chase, every dot ball or single completely flips the win probability! "
            "CSK's tactic has always been to take the game to the last ball and capitalize on the bowler's pressure."
        )

    # Win probability, delta swings, fan tension, and BPM metrics
    if any(k in q_lower for k in ["win prob", "win delta", "delta", "bpm", "heart rate", "tension", "metric", "lowest"]):
        return (
            "Talk about an emotional rollercoaster! On 14.4 with 10 needed off 2, CSK's win probability plummeted "
            "to a match-low 5%, fan heart rates spiked to 156 BPM, and tension hit 94%. But Jadeja's six sparked an "
            "unprecedented +49% Win Delta swing in a single delivery! Whistle Podu!"
        )

    # DLS and target calculation
    if any(k in q_lower for k in ["dls", "171", "revised target", "target of 171"]):
        return (
            "Because of the rain delay, the DLS method reset CSK's target to 171 in 15 overs. "
            "That demanded a blistering Required Run Rate of 11.40 from ball one! In a shortened chase, "
            "every ball is gold, and Rayudu and Jadeja delivered the boundaries when we needed them most. Whistle Podu!"
        )

    # Rahane's crucial cameo
    if any(k in q_lower for k in ["rahane", "ajinkya"]):
        return (
            "Ajinkya Rahane's 27 off 13 balls was pure championship gold! His fearless sixes broke the middle-overs "
            "stranglehold and kept CSK's Required Run Rate within reach. Reborn in canary yellow! Whistle Podu!"
        )

    # Conway & Gaikwad opening stand
    if any(k in q_lower for k in ["conway", "ruturaj", "gaikwad", "opener", "openers", "powerplay"]):
        return (
            "Devon Conway and Ruturaj Gaikwad set the tone with 52 runs in the 4-over powerplay! Chasing 171 in 15 overs "
            "leaves zero room for dot balls, and our openers gave us the perfect launching pad. Whistle Podu!"
        )

    # Sai Sudharsan & GT total
    if any(k in q_lower for k in ["sudharsan", "sai", "214", "gujarat"]):
        return (
            "Sai Sudharsan played an astonishing knock of 96 off 47 balls for Gujarat Titans. Chasing down a revised "
            "171 against Shami, Rashid, and Mohit under Ahmedabad pressure required total self-belief from the Yellow Army!"
        )

    # Final delivery 14.6 & winning boundary
    if any(k in q_lower for k in ["14.6", "winning shot", "final ball", "last ball"]) or (
        ("four" in q_lower or "boundary" in q_lower) and ("final" in q_lower or "last" in q_lower or "win" in q_lower)
    ):
        return (
            "4 needed off 1 ball: Mohit bowls a low full toss on the pads, and Sir Jadeja clips it fine past short "
            "fine leg for FOUR! Total euphoria in the dugout as Dhoni lifts Jadeja! Whistle Podu!"
        )

    # 5 Titles & Franchise Legacy
    if any(k in q_lower for k in ["troph", "title", "champion", "history", "five", "5th", "legacy"]):
        return (
            "Five-time IPL Champions (2010, 2011, 2018, 2021, 2023)! From the Chepauk fortress to Ahmedabad, "
            "CSK's legacy under Thala MS Dhoni is unrivaled in T20 history. Whistle Podu!"
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
    elif any(k in q_lower for k in ["mohit", "sharma", "bowler", "yorker"]):
        return (
            "Mohit Sharma bowled his heart out nailing blockhole yorkers. But death overs in a rain-curtailed final "
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
            "generationConfig": {
                "maxOutputTokens": 350,
                "temperature": 0.7,
                "thinkingConfig": {"thinkingBudget": 0},
            },
        }
        headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=3.5) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        short_model = model_name.replace("models/", "")
                        return parts[0]["text"].strip(), short_model
        except urllib.error.HTTPError as e:
            if e.code == 429:
                # Daily quota exhausted or rate-limited; fallback immediately without retrying
                break
            continue
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

    # Auto-load local .env if keys not already present in environment
    if not os.environ.get("GEMINI_API_KEY") and not os.environ.get("ANTHROPIC_API_KEY"):
        try:
            from pathlib import Path
            env_file = Path(__file__).resolve().parent.parent / ".env"
            if env_file.exists():
                from dotenv import load_dotenv
                load_dotenv(env_file)
        except Exception:
            pass

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
