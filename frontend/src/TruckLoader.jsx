import { useState, useEffect, useRef } from "react";
import truckSound from "./assets/trucksound.mp3";
import truckSvg from "./assets/untitled.png";

const TruckLoader = ({ onComplete }) => {
  const [phase, setPhase] = useState("idle");
  const [particles, setParticles] = useState([]);
  const audioRef = useRef(null);
  const truckRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(truckSound);
    audio.loop = true;
    audio.volume = 0;
    audio.load();
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (phase !== "enter" && phase !== "exit" && phase !== "pause") return;
    const isPaused = phase === "pause";

    const interval = setInterval(
      () => {
        const rect = truckRef.current?.getBoundingClientRect();
        const spawnX = rect
          ? rect.left + rect.width * 0.08
          : window.innerWidth / 2 - 120;
        const spawnY = rect
          ? rect.bottom - rect.height * 0.15
          : window.innerHeight / 2 + 40;

        const count = isPaused ? 5 : 2;
        setParticles((prev) => {
          const next = Array.from({ length: count }, () => ({
            id: Math.random(),
            x: spawnX + Math.random() * 14 - 7,
            y: spawnY + Math.random() * 10 - 5,
            size: isPaused ? 18 + Math.random() * 22 : 12 + Math.random() * 14,
            driftX: (Math.random() - 0.6) * 60,
            driftY: isPaused
              ? -(40 + Math.random() * 60)
              : Math.random() * 20 - 5,
            spread: 1.8 + Math.random() * 2.2,
            duration: isPaused
              ? 1400 + Math.random() * 600
              : 800 + Math.random() * 400,
            delay: Math.random() * 80,
            type: isPaused ? "exhaust" : "trail",
          }));
          return [...prev.slice(isPaused ? -40 : -20), ...next];
        });
      },
      isPaused ? 35 : 55,
    );

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("ready"), 20);
    const t1 = setTimeout(() => setPhase("enter"), 80);

    const t2 = setTimeout(() => {
      setPhase("pause");
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      let vol = 0;
      const fadeIn = setInterval(() => {
        if (vol < 0.55) {
          vol += 0.05;
          audio.volume = Math.min(vol, 0.55);
        } else clearInterval(fadeIn);
      }, 60);
    }, 1580);

    const t3 = setTimeout(() => {
      setPhase("exit");
      const audio = audioRef.current;
      if (!audio) return;
      let vol = audio.volume;
      const fadeOut = setInterval(() => {
        if (vol > 0.03) {
          vol -= 0.05;
          audio.volume = Math.max(vol, 0);
        } else {
          clearInterval(fadeOut);
          audio.pause();
        }
      }, 60);
    }, 3580);

    const t4 = setTimeout(() => onComplete?.(), 5200);

    return () => {
      [t0, t1, t2, t3, t4].forEach(clearTimeout);
    };
  }, [onComplete]);

  const TRUCK_WIDTH = 280;
  const isPause = phase === "pause";

  const getTranslateX = () => {
    if (phase === "idle" || phase === "ready") return "-65vw";
    if (phase === "enter" || phase === "pause") return "0vw";
    return "65vw";
  };

  const getTransition = () => {
    if (phase === "idle" || phase === "ready") return "none";
    if (phase === "exit") return "transform 2s cubic-bezier(.22,.61,.36,1)";
    return "transform 1.5s cubic-bezier(.16,1,.3,1)";
  };

  return (
    <>
      {/* ── GLOBAL STYLE ISOLATION: neutralise Tailwind preflight for this component ── */}
      <style>{`
        /* Reset anything Tailwind preflight may have clobbered inside #truck-loader */
        #truck-loader *,
        #truck-loader *::before,
        #truck-loader *::after {
          box-sizing: border-box;
        }
        #truck-loader img {
          display: block;
          max-width: none;   /* preflight sets max-width:100% which squashes the truck */
          height: auto;
        }

        @keyframes vibrate {
          0%,100% { transform: translateY(0px); }
          25%     { transform: translateY(-1.5px) rotate(-0.3deg); }
          75%     { transform: translateY(1.5px)  rotate(0.3deg); }
        }
        .truck-vibration { animation: vibrate 0.08s linear infinite; }

        @keyframes smokeRise {
          0% {
            transform: scale(0.6) translate(0px, 0px) rotate(0deg);
            opacity: 0.8;
            filter: blur(2px);
          }
          20% {
            transform: scale(0.9)
              translate(calc(var(--dx) * 0.2), calc(var(--dy) * 0.2))
              rotate(-3deg);
            opacity: 0.65;
          }
          40% {
            transform: scale(1.3)
              translate(calc(var(--dx) * 0.4), calc(var(--dy) * 0.45))
              rotate(2deg);
            opacity: 0.45;
            filter: blur(4px);
          }
          70% {
            transform: scale(1.9)
              translate(calc(var(--dx) * 0.7), calc(var(--dy) * 0.75))
              rotate(-2deg);
            opacity: 0.25;
            filter: blur(6px);
          }
          100% {
            transform: scale(2.6)
              translate(var(--dx), var(--dy))
              rotate(4deg);
            opacity: 0;
            filter: blur(8px);
          }
        }
      `}</style>

      <div
        id="truck-loader"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          overflow: "hidden",
          background: "#e8e8ea",
        }}
      >
        {/* VIGNETTE */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 55% 55% at 50% 50%, transparent 25%, rgba(0,0,0,0.6) 100%)",
            opacity: isPause ? 1 : 0,
            transition: "opacity 0.9s ease",
          }}
        />

        {/* GROUND GLOW */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, 30px)",
            width: "500px",
            height: "100px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(249,115,22,0.2) 0%, transparent 70%)",
            zIndex: 11,
            pointerEvents: "none",
            opacity: isPause ? 1 : 0,
            transition: "opacity 0.6s ease",
            filter: "blur(10px)",
          }}
        />

        {/* SMOKE PARTICLES */}
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "fixed",
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              background:
                p.type === "exhaust"
                  ? "radial-gradient(circle, rgba(160,160,170,0.65) 0%, rgba(130,130,140,0.3) 50%, transparent 100%)"
                  : "radial-gradient(circle, rgba(180,180,190,0.7) 0%, rgba(150,150,160,0.2) 60%, transparent 100%)",
              filter: `blur(${p.type === "exhaust" ? 5 : 3}px)`,
              pointerEvents: "none",
              zIndex: 23,
              animation: `smokeRise ${p.duration}ms ease-out ${p.delay}ms both`,
              "--dx": `${p.driftX}px`,
              "--dy": `${p.driftY}px`,
              "--spread": p.spread,
            }}
          />
        ))}

        {/* TRUCK */}
        <div
          ref={truckRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -58%) translateX(${getTranslateX()})`,
            width: `${TRUCK_WIDTH}px`,
            transition: getTransition(),
            zIndex: 20,
            willChange: "transform",
            filter: isPause
              ? "drop-shadow(0 0 16px rgba(249,115,22,0.5)) drop-shadow(0 0 36px rgba(249,115,22,0.22))"
              : "none",
          }}
        >
          <div
            className={
              isPause ? "truck-vibration" : phase === "enter" ? "" : ""
            }
          >
            <img
              src={truckSvg}
              alt="Truck"
              style={{
                width: "280px",
                height: "auto",
                display: "block",
                // ✅ REMOVED background: "red" — this was the main cause of SVG distortion
              }}
            />
          </div>
        </div>

        {/* BRAND */}
        <div
          style={{
            position: "absolute",
            bottom: "16%",
            left: "50%",
            width: "100vw",
            transform: `translateX(-50%) translateY(${isPause ? "0px" : "28px"})`,
            opacity: isPause ? 1 : 0,
            transition: "opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s",
            zIndex: 30,
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          {/* Ghost outline layer */}
          <div
            style={{
              fontFamily: "'Arial Black', Arial, sans-serif",
              fontSize: "clamp(2rem, 8vw, 5rem)",
              fontWeight: 900,
              letterSpacing: "0.5em",
              color: "transparent",
              WebkitTextStroke: "1px rgba(249,115,22,0.35)",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%) translateY(5px)",
              whiteSpace: "nowrap",
              userSelect: "none",
              lineHeight: 1.1,
            }}
          >
            SARTHIX
          </div>
          {/* Solid text layer */}
          <div
            style={{
              fontFamily: "'Arial Black', Arial, sans-serif",
              fontSize: "clamp(2rem, 8vw, 5rem)",
              fontWeight: 900,
              letterSpacing: "0.5em",
              color: "#1a1a2e",
              whiteSpace: "nowrap",
              position: "relative",
              lineHeight: 1.1,
            }}
          >
            SARTHIX
          </div>
          {/* Tagline */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.9rem",
              letterSpacing: "0.35em",
              color: "#f97316",
              marginTop: "10px",
              opacity: isPause ? 1 : 0,
              transition: "opacity 0.5s ease 0.7s",
              fontWeight: 600,
            }}
          >
            LOGISTICS · REDEFINED
          </div>
        </div>
      </div>
    </>
  );
};

export default TruckLoader;