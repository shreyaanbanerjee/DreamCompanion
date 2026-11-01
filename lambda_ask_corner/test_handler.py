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

