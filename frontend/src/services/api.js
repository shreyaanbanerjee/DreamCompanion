/**
 * Client service for calling the 'Ask Corner' AI Chat service (AWS API Gateway + Lambda or local simulator).
 */

export function getApiBaseUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'https://2w9xgvn0hi.execute-api.us-east-1.amazonaws.com/';
}

const API_BASE_URL = getApiBaseUrl();

export async function askCornerAI(question, matchContext = '') {
  let endpoint = '';

  if (API_BASE_URL) {
    endpoint = API_BASE_URL.endsWith('/') ? `${API_BASE_URL}ask` : `${API_BASE_URL}/ask`;
  } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    endpoint = 'http://localhost:8000/ask';
  }

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          match_context: matchContext,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Network call to backend /ask failed, using offline fallback:', err);
    }
  }

  // Graceful offline fallback
  return mockLocalCornerResponse(question, matchContext);
}

function mockLocalCornerResponse(question, matchContext) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = question.toLowerCase();
      let answer = "";

      if (q.includes("dhoni") || q.includes("thala")) {
        answer = "Thala MS Dhoni's calm tactical masterclass anchors the entire squad. Even with his heavily strapped knee and that heart-wrenching golden duck, his tactical clarity from the dugout never wavers. Take the game deep and execute under pressure! Whistle Podu!";
      } else if (q.includes("jadeja") || q.includes("sir") || q.includes("sword") || q.includes("10 off 2")) {
        answer = "Never doubt Sir Ravindra Jadeja! Needing 10 off 2 balls with Mohit firing yorkers is where legends are forged. Look for the straight drive or the fine tickle past short fine leg. Whistle Podu!";
      } else if (q.includes("equation") || q.includes("rate") || q.includes("need") || q.includes("rrr")) {
        answer = `Target is 171 in 15 overs (DLS revised). ${matchContext ? `Current situation: ${matchContext}. ` : ''}Every boundary counts, keep the belief strong! Whistle Podu!`;
      } else {
        answer = `100,000 fans, the Yellow Army roaring in Ahmedabad! ${matchContext ? `With ${matchContext}, ` : ''}Keep your nerve, back the batters, and whistle loud!`;
      }

      resolve({
        success: true,
        response: answer,
        provider: "fan_lore_engine",
        persona: "CSK Corner Companion (Whistle Podu Edition)"
      });
    }, 400);
  });
}
