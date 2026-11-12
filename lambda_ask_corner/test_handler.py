import json
import pytest
from handler import lambda_handler


def test_cors_options_preflight():
    event = {
        "httpMethod": "OPTIONS",
        "headers": {},
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    assert response["headers"]["Access-Control-Allow-Origin"] == "*"
    assert "POST" in response["headers"]["Access-Control-Allow-Methods"]


def test_ask_dhoni_question():
    event = {
        "httpMethod": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "question": "What is Thala Dhoni's strategy in this chase?",
            "match_context": "CSK need 21 off the last over."
        })
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert "response" in body
    assert body["success"] is True
    assert any(term in body["response"].lower() for term in ["dhoni", "thala", "csk", "whistle", "calm", "ice"])


def test_ask_jadeja_question():
    event = {
        "httpMethod": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "question": "Can Sir Jadeja pull this off with 10 needed off 2 balls?"
        })
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert "response" in body
    assert any(term in body["response"].lower() for term in ["jadeja", "sir", "clutch", "sword", "boundary"])


def test_invalid_json_body():
    event = {
        "httpMethod": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": "not-a-valid-json"
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["success"] is False
    assert "error" in body


def test_empty_question():
    event = {
        "httpMethod": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"question": ""})
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 400


def test_missing_body():
    event = {
        "httpMethod": "POST",
        "headers": {},
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["success"] is False


def test_greeting_query():
    event = {
        "httpMethod": "POST",
        "body": json.dumps({"question": "vanakkam"})
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["success"] is True
    assert "Vanakkam" in body["response"] or "Whistle Podu" in body["response"]


def test_what_if_query():
    event = {
        "httpMethod": "POST",
        "body": json.dumps({
            "question": "Why did Mohit bowl a length ball on 14.5?",
            "match_context": "CSK need 10 off 2 balls."
        })
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["success"] is True
    assert "response" in body


def test_base64_encoded_body():
    import base64
    payload = json.dumps({"question": "What is Dhoni's mindset?", "match_context": "CSK need 10 off 2"})
    event = {
        "httpMethod": "POST",
        "isBase64Encoded": True,
        "body": base64.b64encode(payload.encode("utf-8")).decode("utf-8"),
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["success"] is True
    assert "dhoni" in body["response"].lower() or "thala" in body["response"].lower()


def test_rahane_and_openers_queries():
    # Rahane
    res_rahane = lambda_handler({"httpMethod": "POST", "body": json.dumps({"question": "Tell me about Ajinkya Rahane"})}, None)
    assert res_rahane["statusCode"] == 200
    body_r = json.loads(res_rahane["body"])
    assert "rahane" in body_r["response"].lower() or "27" in body_r["response"]

    # Openers
    res_openers = lambda_handler({"httpMethod": "POST", "body": json.dumps({"question": "How did Conway and Ruturaj start the powerplay?"})}, None)
    assert res_openers["statusCode"] == 200
    body_o = json.loads(res_openers["body"])
    assert "conway" in body_o["response"].lower() or "gaikwad" in body_o["response"].lower() or "powerplay" in body_o["response"].lower()


def test_metrics_and_trophy_queries():
    # Metrics
    res_metric = lambda_handler({"httpMethod": "POST", "body": json.dumps({"question": "What was the lowest win probability and delta swing?"})}, None)
    assert res_metric["statusCode"] == 200
    body_m = json.loads(res_metric["body"])
    assert "5%" in body_m["response"] or "win delta" in body_m["response"].lower() or "bpm" in body_m["response"].lower()

    # Trophy
    res_trophy = lambda_handler({"httpMethod": "POST", "body": json.dumps({"question": "How many trophies have CSK won?"})}, None)
    assert res_trophy["statusCode"] == 200
    body_t = json.loads(res_trophy["body"])
    assert any(term in body_t["response"].lower() for term in ["five", "5", "troph", "anbuden", "champions", "whistle"])

