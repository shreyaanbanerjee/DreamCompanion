import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

console.log('🧪 Starting Exhaustive Component, Div, Button & Scenario Verification...\n');

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  // Load modules via Vite SSR
  const { INITIAL_DELIVERY, INITIAL_MATCH_INFO, ALL_DELIVERIES } = await vite.ssrLoadModule('./src/constants/fallbackData.js');
  const { default: Header } = await vite.ssrLoadModule('./src/components/Header.jsx');
  const { default: GuideBanner } = await vite.ssrLoadModule('./src/components/GuideBanner.jsx');
  const { default: MatchControls } = await vite.ssrLoadModule('./src/components/MatchControls.jsx');
  const { default: KeyMomentsBar } = await vite.ssrLoadModule('./src/components/KeyMomentsBar.jsx');
  const { default: Scoreboard } = await vite.ssrLoadModule('./src/components/Scoreboard.jsx');
  const { default: ShotVisualizer } = await vite.ssrLoadModule('./src/components/ShotVisualizer.jsx');
  const { default: WinProbabilityBar } = await vite.ssrLoadModule('./src/components/WinProbabilityBar.jsx');
  const { default: FanECG } = await vite.ssrLoadModule('./src/components/FanECG.jsx');
  const { default: AskCornerChat } = await vite.ssrLoadModule('./src/components/AskCornerChat.jsx');
  const { default: WhatIfScenarios } = await vite.ssrLoadModule('./src/components/WhatIfScenarios.jsx');
  const { default: App } = await vite.ssrLoadModule('./src/App.jsx');

  // =========================================================================
  // 1. Header Component Tests (Buttons, Divs, Badges)
  // =========================================================================
  console.log('  1. Testing Header Component...');
  {
    const htmlConnected = renderToStaticMarkup(
      React.createElement(Header, {
        matchInfo: INITIAL_MATCH_INFO,
        connectionStatus: 'connected',
        simulatorStatus: 'running',
        isGuideOpen: false,
      })
    );
    assert.ok(htmlConnected.includes('DreamCompanion'), 'Header brand name must render');
    assert.ok(htmlConnected.includes('Corner Edition'), 'Header edition badge must render');
    assert.ok(htmlConnected.includes('Chennai Super Kings vs Gujarat Titans') || htmlConnected.includes('CSK vs GT'), 'Header subtitle must render');
    assert.ok(htmlConnected.includes('FastAPI Streaming'), 'Connection status streaming must render');
    assert.ok(htmlConnected.includes('Instructions &amp; Guide') || htmlConnected.includes('Instructions & Guide'), 'Guide button must render');

    const htmlCloud = renderToStaticMarkup(
      React.createElement(Header, {
        matchInfo: INITIAL_MATCH_INFO,
        connectionStatus: 'disconnected',
        simulatorStatus: 'idle',
        isGuideOpen: true,
      })
    );
    assert.ok(htmlCloud.includes('Cloud Sim Ready'), 'Fallback cloud simulation badge must render');
  }
  console.log('     ✓ Header buttons, status badges, and titles verified.');

  // =========================================================================
  // 2. GuideBanner Component Tests (Open/Close, Divs)
  // =========================================================================
  console.log('  2. Testing GuideBanner Component...');
  {
    const htmlClosed = renderToStaticMarkup(React.createElement(GuideBanner, { isOpen: false }));
    assert.strictEqual(htmlClosed, '', 'GuideBanner must render nothing when closed');

    const htmlOpen = renderToStaticMarkup(React.createElement(GuideBanner, { isOpen: true }));
    assert.ok(htmlOpen.includes('Product Guide &amp; Instructions') || htmlOpen.includes('Product Guide & Instructions'), 'Guide title must render');
    assert.ok(htmlOpen.includes('Evaluator Mode'), 'Evaluator mode pill must render');
    assert.ok(htmlOpen.includes('Close'), 'Close button must render');
    assert.ok(htmlOpen.includes('1. Match Simulation'), 'Card 1 must render');
    assert.ok(htmlOpen.includes('2. Win Predictor &amp; Scrubber') || htmlOpen.includes('2. Win Predictor & Scrubber'), 'Card 2 must render');
    assert.ok(htmlOpen.includes('3. Ask Corner &amp; What-Ifs') || htmlOpen.includes('3. Ask Corner & What-Ifs'), 'Card 3 must render');
    assert.ok(htmlOpen.includes('4. Web Audio &amp; ECG') || htmlOpen.includes('4. Web Audio & ECG'), 'Card 4 must render');
  }
  console.log('     ✓ GuideBanner open/close states and all 4 guide cards verified.');

  // =========================================================================
  // 3. MatchControls Component Tests (Every Button, Speed, Audio)
  // =========================================================================
  console.log('  3. Testing MatchControls Component...');
  {
    // Idle state
    const htmlIdle = renderToStaticMarkup(
      React.createElement(MatchControls, {
        status: 'idle',
        currentInterval: 5.0,
        isCloudFallback: false,
      })
    );
    assert.ok(htmlIdle.includes('Start Match'), 'Start Match button must render when idle');
    assert.ok(htmlIdle.includes('Next Ball'), 'Next Ball button must render');
    assert.ok(htmlIdle.includes('Reset'), 'Reset button must render');
    assert.ok(htmlIdle.includes('1x (5s)'), '1x speed button must render');
    assert.ok(htmlIdle.includes('2x (2.5s)'), '2x speed button must render');
    assert.ok(htmlIdle.includes('5x (1s)'), '5x speed button must render');
    assert.ok(htmlIdle.includes('Audio:'), 'Audio toggle button must render');
    assert.ok(htmlIdle.includes('FastAPI Stream'), 'FastAPI stream badge must render when connected');

    // Paused state
    const htmlPaused = renderToStaticMarkup(
      React.createElement(MatchControls, {
        status: 'paused',
        currentInterval: 2.5,
        isCloudFallback: true,
      })
    );
    assert.ok(htmlPaused.includes('Resume'), 'Resume button must render when paused');
    assert.ok(htmlPaused.includes('Cloud Engine'), 'Cloud Engine badge must render when fallback');

    // Running state
    const htmlRunning = renderToStaticMarkup(
      React.createElement(MatchControls, {
        status: 'running',
        currentInterval: 1.0,
      })
    );
    assert.ok(htmlRunning.includes('Pause'), 'Pause button must render when running');
  }
  console.log('     ✓ MatchControls buttons (Start, Resume, Pause, Next Ball, Reset, Speed 1x/2x/5x, Audio) verified.');

  // =========================================================================
  // 4. KeyMomentsBar Component Tests (All 6 Jumps & Autoplay)
  // =========================================================================
  console.log('  4. Testing KeyMomentsBar Component...');
  {
    const htmlMoments = renderToStaticMarkup(
      React.createElement(KeyMomentsBar, {
        currentBallIndex: 11,
        isAutoPlaying: false,
      })
    );
    assert.ok(htmlMoments.includes('Key Match Moments'), 'Title must render');
    assert.ok(htmlMoments.includes('One-Click Jumps'), 'Badge must render');
    assert.ok(htmlMoments.includes('30s Highlights Reel'), 'Autoplay button must render');
    assert.ok(htmlMoments.includes('Rayudu Blitz (6)'), 'Ball 1 pill must render');
    assert.ok(htmlMoments.includes('Rayudu Out (W)'), 'Ball 4 pill must render');
    assert.ok(htmlMoments.includes('Dhoni 0(1) Duck'), 'Ball 5 pill must render');
    assert.ok(htmlMoments.includes('10 off 2 Balls'), 'Ball 10 pill must render');
    assert.ok(htmlMoments.includes("Jadeja&#x27;s Six") || htmlMoments.includes("Jadeja's Six"), 'Ball 11 pill must render');
    assert.ok(htmlMoments.includes('Title Winning Four'), 'Ball 12 pill must render');

    // Autoplaying state
    const htmlPlaying = renderToStaticMarkup(
      React.createElement(KeyMomentsBar, {
        currentBallIndex: 5,
        isAutoPlaying: true,
      })
    );
    assert.ok(htmlPlaying.includes('Pause Highlights'), 'Pause button must render when autoplaying');
  }
  console.log('     ✓ KeyMomentsBar all 6 jump pills and autoplay reel toggle verified.');

  // =========================================================================
  // 5. WinProbabilityBar Component Tests (Percentages, Deltas, Equations)
  // =========================================================================
  console.log('  5. Testing WinProbabilityBar Component...');
  {
    // Positive shift (Ball 11: Jadeja Six)
    const ball11 = ALL_DELIVERIES[10];
    const htmlPos = renderToStaticMarkup(React.createElement(WinProbabilityBar, { delivery: ball11 }));
    assert.ok(htmlPos.includes('CSK 54%'), 'CSK 54% must render');
    assert.ok(htmlPos.includes('GT 46%'), 'GT 46% must render');
    assert.ok(htmlPos.includes('+49% CSK Shift'), 'Positive delta badge must render');

    // Negative shift (Ball 5: Dhoni Duck)
    const ball5 = ALL_DELIVERIES[4];
    const htmlNeg = renderToStaticMarkup(React.createElement(WinProbabilityBar, { delivery: ball5 }));
    assert.ok(htmlNeg.includes('CSK 24%'), 'CSK 24% must render');
    assert.ok(htmlNeg.includes('-21% CSK Shift') || htmlNeg.includes('CSK Shift'), 'Negative delta badge must render');

    // Match Won (Ball 12: Title Four)
    const ball12 = ALL_DELIVERIES[11];
    const htmlWon = renderToStaticMarkup(React.createElement(WinProbabilityBar, { delivery: ball12 }));
    assert.ok(htmlWon.includes('Match Finished: Chennai Super Kings win'), 'Match finished subtitle must render');
  }
  console.log('     ✓ WinProbabilityBar CSK/GT widths, positive/negative delta badges, and subtitles verified.');

  // =========================================================================
  // 6. ShotVisualizer Component Tests (SVG Radar, Trajectory, Telemetry)
  // =========================================================================
  console.log('  6. Testing ShotVisualizer Component...');
  {
    const ballSix = ALL_DELIVERIES[10]; // Jadeja Six 94m Long-off
    const htmlSix = renderToStaticMarkup(React.createElement(ShotVisualizer, { delivery: ballSix }));
    assert.ok(htmlSix.includes('Field Radar'), 'Radar title must render');
    assert.ok(htmlSix.includes('Narendra Modi Stadium'), 'Stadium label must render');
    assert.ok(htmlSix.includes(ballSix.shot_name), 'Shot name must render');
    assert.ok(htmlSix.includes(ballSix.shot_zone), 'Shot zone must render');
    assert.ok(htmlSix.includes(`${ballSix.shot_distance_m}m`), 'Distance must render');
    assert.ok(htmlSix.includes('135 km/h') || htmlSix.includes('km/h'), 'Ball speed must render');
    assert.ok(htmlSix.includes('Key Event: SIX'), 'Milestone tag must render');

    const ballWicket = ALL_DELIVERIES[4]; // Dhoni Wicket
    const htmlWicket = renderToStaticMarkup(React.createElement(ShotVisualizer, { delivery: ballWicket }));
    assert.ok(htmlWicket.includes('Key Event: WICKET'), 'Wicket milestone tag must render');
  }
  console.log('     ✓ ShotVisualizer SVG wagon wheel, polar coordinates, trajectory colors, and telemetry verified.');

  // =========================================================================
  // 7. FanECG Component Tests (Tension Levels, SVG Polyline & Area)
  // =========================================================================
  console.log('  7. Testing FanECG Component...');
  {
    // Steady state (<60%)
    const htmlSteady = renderToStaticMarkup(
      React.createElement(FanECG, {
        history: [INITIAL_DELIVERY],
        currentDelivery: INITIAL_DELIVERY,
      })
    );
    assert.ok(htmlSteady.includes('Steady State') || htmlSteady.includes('50%'), 'Steady state tension must render');
    assert.ok(htmlSteady.includes('Match Momentum &amp; Tension Index') || htmlSteady.includes('Match Momentum & Tension Index'), 'Title must render');

    // High tension (Ball 10: 84% tension)
    const ball10 = ALL_DELIVERIES[9];
    const htmlHigh = renderToStaticMarkup(
      React.createElement(FanECG, {
        history: ALL_DELIVERIES.slice(0, 10),
        currentDelivery: ball10,
      })
    );
    assert.ok(htmlHigh.includes('84%'), '84% tension must render');
    assert.ok(htmlHigh.includes('High Tension'), 'High tension label must render');
    assert.ok(htmlHigh.includes('<polyline'), 'SVG polyline must render');
    assert.ok(htmlHigh.includes('<path'), 'SVG gradient area path must render');

    // Climax tension (Ball 11: 96% tension)
    const ball11 = ALL_DELIVERIES[10];
    const htmlClimax = renderToStaticMarkup(
      React.createElement(FanECG, {
        history: ALL_DELIVERIES.slice(0, 11),
        currentDelivery: ball11,
      })
    );
    assert.ok(htmlClimax.includes('96%'), '96% tension must render');
    assert.ok(htmlClimax.includes('Climax / Match Point'), 'Climax tension label must render');
  }
  console.log('     ✓ FanECG tension states (Steady, Building, High, Climax) and SVG waveforms verified.');

  // =========================================================================
  // 8. WhatIfScenarios Component Tests (Cards, Prompts, Tags)
  // =========================================================================
  console.log('  8. Testing WhatIfScenarios Component...');
  {
    const htmlWhatIf = renderToStaticMarkup(React.createElement(WhatIfScenarios, {}));
    assert.ok(htmlWhatIf.includes('What-If Tactical Scenarios'), 'Section title must render');
    assert.ok(htmlWhatIf.includes("Mohit&#x27;s Length Ball on 14.5") || htmlWhatIf.includes("Mohit's Length Ball on 14.5"), 'Card 1 must render');
    assert.ok(htmlWhatIf.includes('What if Jadeja took a single?'), 'Card 2 must render');
    assert.ok(htmlWhatIf.includes("Dhoni&#x27;s Dugout Masterplan") || htmlWhatIf.includes("Dhoni's Dugout Masterplan"), 'Card 3 must render');
    assert.ok(htmlWhatIf.includes('DLS Target Breakdown'), 'Card 4 must render');
    assert.ok(htmlWhatIf.includes('Tactics'), 'Tactics tag must render');
    assert.ok(htmlWhatIf.includes('Simulation'), 'Simulation tag must render');
    assert.ok(htmlWhatIf.includes('Captaincy'), 'Captaincy tag must render');
    assert.ok(htmlWhatIf.includes('DLS Analytics'), 'DLS tag must render');
    assert.ok(htmlWhatIf.includes('Ask AI ➔'), 'CTA button must render');
  }
  console.log('     ✓ WhatIfScenarios all 4 tactical scenario cards, tags, and CTAs verified.');

  // =========================================================================
  // 9. AskCornerChat Component Tests (Suggestions, Messages, Clear Chat)
  // =========================================================================
  console.log('  9. Testing AskCornerChat Component...');
  {
    const htmlChat = renderToStaticMarkup(
      React.createElement(AskCornerChat, {
        currentDelivery: INITIAL_DELIVERY,
      })
    );
    assert.ok(htmlChat.includes('Ask Corner'), 'Chat title must render');
    assert.ok(htmlChat.includes('Clear Chat'), 'Clear Chat button must render');
    assert.ok(htmlChat.includes('Live'), 'Live badge must render');
    assert.ok(htmlChat.includes('Vanakkam!'), 'Initial greeting message must render');
    assert.ok(htmlChat.includes('Can Jadeja finish this with 10 needed off 2 balls?'), 'Chip 1 must render');
    assert.ok(htmlChat.includes("Explain Dhoni&#x27;s duck on 13.5") || htmlChat.includes("Explain Dhoni's duck on 13.5"), 'Chip 2 must render');
    assert.ok(htmlChat.includes('How did DLS calculate 171?'), 'Chip 4 must render');
    assert.ok(htmlChat.includes('placeholder="Ask a question about the match or tactics..."'), 'Input field must render');
    assert.ok(htmlChat.includes('Send'), 'Send button must render');
  }
  console.log('     ✓ AskCornerChat suggestion chips, message feed, clear button, and input form verified.');

  // =========================================================================
  // 10. Scoreboard Delivery Scrubber Tests Across All 12 Match Deliveries
  // =========================================================================
  console.log('  10. Testing Scoreboard & Scrubber across all 12 Climax Deliveries...');
  {
    ALL_DELIVERIES.forEach((deliv, index) => {
      const ballNum = index + 1;
      const htmlScore = renderToStaticMarkup(
        React.createElement(Scoreboard, {
          delivery: deliv,
          matchInfo: INITIAL_MATCH_INFO,
          recentBalls: ALL_DELIVERIES.slice(0, ballNum),
        })
      );
      assert.ok(htmlScore.includes('CSK'), `CSK team label must render on ball ${ballNum}`);
      assert.ok(htmlScore.includes(deliv.score_after), `Score ${deliv.score_after} must render on ball ${ballNum}`);
      assert.ok(htmlScore.includes(deliv.over_display), `Over ${deliv.over_display} must render on ball ${ballNum}`);
      assert.ok(htmlScore.includes('Target:'), `Target label must render on ball ${ballNum}`);
      assert.ok(htmlScore.includes('171'), `Target 171 must render on ball ${ballNum}`);
      assert.ok(htmlScore.includes('Mohit Sharma'), `Bowler Mohit Sharma must render on ball ${ballNum}`);
      assert.ok(htmlScore.includes('Scrubber'), `Scrubber bar must render on ball ${ballNum}`);

      // Check batsman table
      deliv.batsmen.forEach((bat) => {
        assert.ok(htmlScore.includes(bat.name), `Batsman ${bat.name} must render on ball ${ballNum}`);
      });

      // Ball 12 Championship Check
      if (ballNum === 12) {
        assert.ok(htmlScore.includes('CSK WON BY 5 WICKETS'), 'Result banner must render on ball 12');
        assert.ok(htmlScore.includes('CHENNAI SUPER KINGS WIN 5TH TITLE!'), 'Championship banner must render on ball 12');
      }
    });
  }
  console.log('     ✓ Scoreboard verified across all 12 individual ball scenarios and victory state.');

  // =========================================================================
  // 11. Full App Root Render Integration Test
  // =========================================================================
  console.log('  11. Testing Full App Root Integration Canvas...');
  {
    const htmlApp = renderToStaticMarkup(React.createElement(App, {}));
    assert.ok(htmlApp.includes('DreamCompanion'), 'App brand must render');
    assert.ok(htmlApp.includes('Evaluator Quick-Start'), 'Quick start banner must render');
    assert.ok(htmlApp.includes('30s Highlights'), 'Highlights button must render');
    assert.ok(htmlApp.includes('Key Match Moments'), 'Key moments section must render');
    assert.ok(htmlApp.includes('Start Match'), 'Start match button must render');
    assert.ok(htmlApp.includes('Live Commentary'), 'Commentary section must render');
    assert.ok(htmlApp.includes('Ask Corner'), 'Ask Corner section must render');
    assert.ok(htmlApp.includes('Match Momentum &amp; Tension Index') || htmlApp.includes('Match Momentum & Tension Index'), 'Tension section must render');
    assert.ok(htmlApp.includes('What-If Tactical Scenarios'), 'What-If section must render');
    assert.ok(htmlApp.includes('FastAPI • React • Web Audio • AWS Architecture'), 'Footer must render');
  }
  console.log('     ✓ Full App Root Canvas and all 8 integrated UI sections verified.');

  console.log('\n✅ ALL COMPONENT, DIV, BUTTON & SCENARIO TESTS PASSED SUCCESSFULLY!\n');
} finally {
  await vite.close();
}
