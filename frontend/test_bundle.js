import assert from 'node:assert';
import { ALL_DELIVERIES, INITIAL_DELIVERY, INITIAL_MATCH_INFO } from './src/constants/fallbackData.js';
import * as audioModule from './src/utils/audioFx.js';
import { askCornerAI, getApiBaseUrl } from './src/services/api.js';

console.log('🧪 Starting Frontend Integrity & Unit Verification...');

// 1. Verify Fallback Data
assert.strictEqual(INITIAL_MATCH_INFO.id, 'ipl_2023_final', 'Match ID must be ipl_2023_final');
assert.strictEqual(INITIAL_MATCH_INFO.revised_target, 171, 'Target must be 171');
assert.strictEqual(ALL_DELIVERIES.length, 12, 'Must have exactly 12 deliveries');

ALL_DELIVERIES.forEach((d, idx) => {
  const ballNum = idx + 1;
  assert.strictEqual(d.ball_index, ballNum, `Ball index must be ${ballNum}`);
  assert.ok(d.over_display, `Over display must exist for ball ${ballNum}`);
  assert.ok(d.ai_commentary, `Commentary must exist for ball ${ballNum}`);
  assert.strictEqual(d.win_prob_csk + d.win_prob_gt, 100, `Win probabilities must sum to 100 on ball ${ballNum}`);
  assert.ok(d.emotional_index >= 0 && d.emotional_index <= 100, `Emotional index in bounds for ball ${ballNum}`);
  assert.ok(d.shot_name, `Shot name must exist for ball ${ballNum}`);
  assert.ok(d.shot_zone, `Shot zone must exist for ball ${ballNum}`);
  assert.ok(d.shot_angle_deg >= 0 && d.shot_angle_deg <= 360, `Shot angle in bounds for ball ${ballNum}`);
  assert.ok(Array.isArray(d.batsmen) && d.batsmen.length === 2, `Two batsmen must exist on ball ${ballNum}`);
  assert.ok(d.bowler_stats && d.bowler_stats.name === 'Mohit Sharma', 'Bowler must be Mohit Sharma');
});

console.log('  ✓ 12 Climax Deliveries & Telemetry verified.');

// 2. Verify Audio Module Exports
assert.strictEqual(typeof audioModule.playBatCrack, 'function', 'playBatCrack must be a function');
assert.strictEqual(typeof audioModule.playWicketSound, 'function', 'playWicketSound must be a function');
assert.strictEqual(typeof audioModule.playChampionshipChime, 'function', 'playChampionshipChime must be a function');
assert.strictEqual(typeof audioModule.toggleAudio, 'function', 'toggleAudio must be a function');
assert.strictEqual(typeof audioModule.setAudioEnabled, 'function', 'setAudioEnabled must be a function');

console.log('  ✓ Web Audio API Sound Synthesizer exports verified.');

// 3. Verify API Service
assert.strictEqual(typeof askCornerAI, 'function', 'askCornerAI must be a function');
const defaultUrl = getApiBaseUrl();
assert.ok(defaultUrl.includes('execute-api.us-east-1.amazonaws.com'), 'Default API URL must target live API Gateway');

console.log('  ✓ API Gateway routing & endpoints verified.');

console.log('✅ ALL FRONTEND INTEGRITY CHECKS PASSED SUCCESSFULLY!\n');
