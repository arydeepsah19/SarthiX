import { COLORS, RADIUS } from "./tokens.js";

const PULSE_STYLE = `
  @keyframes sarthix-pulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.9; }
  }
`;

function SkeletonBlock({ width = "100%", height = 16, radius = 6, delay = 0 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#1f1f1f",
        animationName: "sarthix-pulse",
        animationDuration: "1.6s",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export default function DashboardSkeleton({ cards = 5, rows = 2 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{PULSE_STYLE}</style>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 130,
              background: "#111",
              border: `1px solid ${COLORS.border}`,
              borderRadius: RADIUS.lg,
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <SkeletonBlock width="60%" height={11} delay={i * 0.08} />
            <SkeletonBlock
              width="45%"
              height={28}
              radius={4}
              delay={i * 0.08 + 0.1}
            />
            <SkeletonBlock width="70%" height={10} delay={i * 0.08 + 0.2} />
          </div>
        ))}
      </div>

      {Array.from({ length: rows }).map((_, ri) => (
        <div
          key={ri}
          style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}
        >
          {[0, 1].map((ci) => (
            <div
              key={ci}
              style={{
                background: "#0e0e0e",
                border: `1px solid ${COLORS.borderMid}`,
                borderRadius: RADIUS.xl,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <SkeletonBlock
                width="35%"
                height={12}
                delay={ri * 0.1 + ci * 0.05}
              />
              {Array.from({ length: 4 }).map((_, li) => (
                <div
                  key={li}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <SkeletonBlock
                    width="55%"
                    height={13}
                    delay={ri * 0.1 + ci * 0.05 + li * 0.06}
                  />
                  <SkeletonBlock
                    width="20%"
                    height={13}
                    delay={ri * 0.1 + ci * 0.05 + li * 0.06 + 0.05}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
