// src/SpaceTypingGame.jsx
import React, { useEffect, useRef, useState } from "react";

const LEVELS = [
  {
    id: 1,
    name: "Level 1: Warm-up",
    words: ["cat", "dog", "sun", "star", "ship", "code", "grid"],
    spawnInterval: 1600,
    speed: 60,
    requiredKills: 12,
  },
  {
    id: 2,
    name: "Level 2: Faster",
    words: ["react", "space", "rocket", "planet", "galaxy", "typing"],
    spawnInterval: 1400,
    speed: 85,
    requiredKills: 20,
  },
  {
    id: 3,
    name: "Level 3: Chaos",
    words: [
      "asteroid",
      "keyboard",
      "velocity",
      "supernova",
      "gravity",
      "satellite",
      "blackhole",
    ],
    spawnInterval: 1100,
    speed: 110,
    requiredKills: 30,
  },
];

let WORD_ID_COUNTER = 1;

function createWord(level, canvasWidth) {
  const text =
    level.words[Math.floor(Math.random() * level.words.length)];
  const padding = 70;
  const x = Math.random() * (canvasWidth - padding * 2) + padding;
  const y = -30;

  return {
    id: WORD_ID_COUNTER++,
    text,
    x,
    y,
    typedIndex: 0,
  };
}

const SpaceTypingGame = () => {
  const canvasRef = useRef(null);

  // UI state
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [killsThisLevel, setKillsThisLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // "refs" for game objects
  const wordsRef = useRef([]);
  const activeTargetRef = useRef(null); // word id
  const lastSpawnTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const shipXRef = useRef(0);
  const livesRef = useRef(lives);

  // init ship position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    shipXRef.current = canvas.width / 2;
  }, []);

  // keep livesRef in sync
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  // main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const level = LEVELS[levelIndex];

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      shipXRef.current = canvas.width / 2;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const loop = (timestamp) => {
      if (gameOver) return;

      if (lastFrameTimeRef.current == null) {
        lastFrameTimeRef.current = timestamp;
      }
      const dt = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      updateGame(dt, timestamp, canvas, level, {
        wordsRef,
        activeTargetRef,
        lastSpawnTimeRef,
        livesRef,
        setLives,
        setScore,
        setKillsThisLevel,
        levelIndex,
        setLevelIndex,
        setGameOver,
      });

      drawGame(canvas, ctx, {
        words: wordsRef.current,
        level,
        score,
        lives,
        shipX: shipXRef.current,
        activeTargetId: activeTargetRef.current,
        gameOver,
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameOver, levelIndex, score, lives]);

  // typing logic: focus stays on current word
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;

      const key = e.key.toLowerCase();
      if (!/^[a-z]$/.test(key)) return; // letters only

      const words = wordsRef.current;
      if (!words.length) return;

      const activeId = activeTargetRef.current;

      // case 1: already targeting a word
      if (activeId != null) {
        const w = words.find((word) => word.id === activeId);
        if (!w) {
          activeTargetRef.current = null;
          return;
        }

        if (w.typedIndex < w.text.length) {
          const expected = w.text[w.typedIndex].toLowerCase();
          if (key === expected) {
            w.typedIndex++;
            if (w.typedIndex >= w.text.length) {
              destroyWordAndReward(w.id, {
                wordsRef,
                activeTargetRef,
                setScore,
                setKillsThisLevel,
                levelIndexRefValue: levelIndex,
                setLevelIndex,
                setGameOver,
              });
            }
          }
        }
      } else {
        // case 2: no active target → choose a word whose next letter matches
        const candidates = words.filter((w) => {
          if (w.typedIndex >= w.text.length) return false;
          return (
            w.text[w.typedIndex].toLowerCase() === key
          );
        });

        if (candidates.length) {
          // choose one closest to bottom (higher y)
          candidates.sort((a, b) => b.y - a.y);
          const w = candidates[0];
          activeTargetRef.current = w.id;
          w.typedIndex++;
          if (w.typedIndex >= w.text.length) {
            destroyWordAndReward(w.id, {
              wordsRef,
              activeTargetRef,
              setScore,
              setKillsThisLevel,
              levelIndexRefValue: levelIndex,
              setLevelIndex,
              setGameOver,
            });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, levelIndex]);

  const restartGame = () => {
    wordsRef.current = [];
    activeTargetRef.current = null;
    lastSpawnTimeRef.current = 0;
    lastFrameTimeRef.current = null;
    setScore(0);
    setLives(3);
    setKillsThisLevel(0);
    setLevelIndex(0);
    setGameOver(false);
  };

  return (
    <div style={{width: '30rem'}} className="h-[90vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-2xl border border-slate-700/60 shadow-[0_20px_80px_rgba(15,23,42,0.9)] flex flex-col overflow-hidden">
      {/* HUD */}
      <div className="flex items-center absolute bottom-0 left-0 z-50 gap-4 px-4 py-3 border-b border-slate-700/70 bg-slate-900/70 backdrop-blur">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Level
          </span>
          <span className="text-sm font-semibold text-slate-100">
            {LEVELS[levelIndex]?.name}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Score
          </span>
          <span className="text-sm font-semibold text-emerald-400">
            {score}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Lives
          </span>
          <span
            className={`text-sm font-semibold ${
              lives <= 1
                ? "text-red-400"
                : "text-rose-300"
            }`}
          >
            {lives}
          </span>
        </div>

        <button
          onClick={restartGame}
          className="ml-auto text-xs font-medium px-3 py-1.5 rounded-full border border-slate-500/70 bg-slate-900/70 text-slate-100 hover:bg-indigo-600/80 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(79,70,229,0.6)] active:scale-[0.96] transition"
        >
          Restart
        </button>
      </div>

      {/* Canvas area */}
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          style={{height: '90vh'}}
          className="w-full block"
        />
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur flex flex-col items-center justify-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-50">
              Game Over
            </h2>
            <p className="text-slate-300">
              Final Score:{" "}
              <span className="font-semibold text-emerald-400">
                {score}
              </span>
            </p>
            <button
              onClick={restartGame}
              className="mt-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-50 font-semibold shadow-[0_12px_35px_rgba(59,130,246,0.7)] hover:brightness-110 active:scale-[0.97] transition"
            >
              Play Again
            </button>
          </div>
        )}

        {/* tiny hint at bottom */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-slate-400/80 tracking-[0.18em] uppercase">
          Type to lock on & destroy words
        </div>
      </div>
    </div>
  );
};

// ---------- game helpers ----------

function updateGame(
  dt,
  timestamp,
  canvas,
  level,
  {
    wordsRef,
    activeTargetRef,
    lastSpawnTimeRef,
    livesRef,
    setLives,
    setScore,
    setKillsThisLevel,
    levelIndex,
    setLevelIndex,
    setGameOver,
  }
) {
  const words = wordsRef.current;

  // spawn new words
  if (
    timestamp - lastSpawnTimeRef.current >
    level.spawnInterval
  ) {
    const newWord = createWord(level, canvas.width);
    words.push(newWord);
    lastSpawnTimeRef.current = timestamp;
  }

  // move words downward
  const dy = (level.speed * dt) / 1000;
  for (let w of words) {
    w.y += dy;
  }

  // check words hitting bottom
  const bottomY = canvas.height - 50;
  let lostLife = false;

  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i];
    if (w.y > bottomY) {
      words.splice(i, 1);
      lostLife = true;
      if (activeTargetRef.current === w.id) {
        activeTargetRef.current = null;
      }
    }
  }

  if (lostLife) {
    const newLives = livesRef.current - 1;
    setLives(newLives);
    livesRef.current = newLives;
    if (newLives <= 0) {
      setGameOver(true);
    }
  }
}

function drawGame(
  canvas,
  ctx,
  {
    words,
    level,
    score,
    lives,
    shipX,
    activeTargetId,
    gameOver,
  }
) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  drawSpaceGridBackground(ctx, w, h);

  // ship
  const shipY = h - 40;
  ctx.save();
  ctx.translate(shipX, shipY);
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(14, 10);
  ctx.lineTo(-14, 10);
  ctx.closePath();
  ctx.fillStyle = "#22d3ee";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.restore();

  // words
  ctx.font = "18px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  words.forEach((wrd) => {
    const isActive = wrd.id === activeTargetId;

    const fullText = wrd.text;
    const typed = fullText.slice(0, wrd.typedIndex);
    const remaining = fullText.slice(wrd.typedIndex);

    // measure full width to center
    const fullWidth = ctx.measureText(fullText).width;
    const startX = wrd.x - fullWidth / 2;
    const y = wrd.y;

    // typed part
    ctx.fillStyle = isActive ? "#22c55e" : "#38bdf8";
    ctx.fillText(typed, startX, y);

    // remaining part
    const typedWidth = ctx.measureText(typed).width;
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(remaining, startX + typedWidth, y);

    // underline for active target
    if (isActive) {
      ctx.beginPath();
      ctx.moveTo(startX, y + 12);
      ctx.lineTo(
        startX + typedWidth,
        y + 12
      );
      ctx.strokeStyle = "rgba(34,197,94,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawSpaceGridBackground(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#020617");
  grad.addColorStop(0.35, "#020617");
  grad.addColorStop(1, "#000000");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.strokeStyle = "rgba(56,189,248,0.18)";
  ctx.lineWidth = 1;

  const horizon = h * 0.35;
  const rows = 16;
  const cols = 16;

  // horizontal "perspective" lines
  for (let i = 1; i < rows; i++) {
    const t = i / rows;
    const y = horizon + (h - horizon) * t * t;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // vertical lines converging
  for (let j = 0; j <= cols; j++) {
    const x = (w / cols) * j;
    ctx.beginPath();
    ctx.moveTo(x, horizon);
    ctx.lineTo(w / 2 + (x - w / 2) * 3, h);
    ctx.stroke();
  }

  // stars
  const starCount = 45;
  ctx.fillStyle = "rgba(248,250,252,0.8)";
  for (let i = 0; i < starCount; i++) {
    const sx = Math.random() * w;
    const sy = Math.random() * horizon;
    const r = Math.random() * 1.1 + 0.3;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function destroyWordAndReward(
  wordId,
  {
    wordsRef,
    activeTargetRef,
    setScore,
    setKillsThisLevel,
    levelIndexRefValue,
    setLevelIndex,
    setGameOver,
  }
) {
  const words = wordsRef.current;
  const idx = words.findIndex((w) => w.id === wordId);
  if (idx !== -1) words.splice(idx, 1);

  if (activeTargetRef.current === wordId) {
    activeTargetRef.current = null;
  }

  setScore((prev) => prev + 10);

  setKillsThisLevel((prevKills) => {
    const newKills = prevKills + 1;
    const currentLevel = LEVELS[levelIndexRefValue];

    if (currentLevel && newKills >= currentLevel.requiredKills) {
      const nextIndex = levelIndexRefValue + 1;
      if (nextIndex < LEVELS.length) {
        setLevelIndex(nextIndex);
        return 0;
      } else {
        // all levels cleared → "win"
        setGameOver(true);
      }
    }

    return newKills;
  });
}

export default SpaceTypingGame;
