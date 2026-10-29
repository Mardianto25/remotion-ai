import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring } from "remotion";


export const MultiSceneVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#090d16" }}>
      {/* ADEGAN 1: Intro / Hook (Detik ke-0 sampai ke-5 / Frame 0-150) */}
      <Sequence from={0} durationInFrames={150}>
        <SceneOne />
      </Sequence>

      {/* ADEGAN 2: Isi / Core Message / Produk (Detik ke-5 sampai ke-10 / Frame 150-300) */}
      <Sequence from={150} durationInFrames={150}>
        <SceneTwo />
      </Sequence>

      {/* ADEGAN 3: Outro / Penutup / Call to Action (Detik ke-10 sampai ke-15 / Frame 300-450) */}
      <Sequence from={300} durationInFrames={150}>
        <SceneThree />
      </Sequence>
    </AbsoluteFill>
  );
};

// Komponen Adegan 1
const SceneOne = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = spring({ frame, fps: 30, config: { damping: 10 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 50px" }}>
      <div style={{ opacity, transform: `scale(${scale})`, textAlign: "center" }}>
        <h1 style={{ color: "#ffffff", fontSize: "56px", fontWeight: "bold", marginBottom: "20px" }}>
          Renungan & Cerita
        </h1>
        <p style={{ color: "#38bdf8", fontSize: "32px" }}>
          "Awali hari dengan ketenangan dan niat yang baik."
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Komponen Adegan 2
const SceneTwo = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [0, 20], [50, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 50px", backgroundColor: "#1e1b4b" }}>
      <div style={{ opacity, transform: `translateY(${translateY}px)`, textAlign: "center" }}>
        <h2 style={{ color: "#c084fc", fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}>
          Pesan Bermakna
        </h2>
        <p style={{ color: "#e2e8f0", fontSize: "30px", lineHeight: "1.5" }}>
          Setiap tantangan adalah cara semesta membentuk kita menjadi pribadi yang lebih kuat.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Komponen Adegan 3
const SceneThree = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 50px", backgroundColor: "#064e3b" }}>
      <div style={{ opacity, textAlign: "center" }}>
        <h2 style={{ color: "#34d399", fontSize: "52px", fontWeight: "bold", marginBottom: "20px" }}>
          Terima Kasih
        </h2>
        <p style={{ color: "#ffffff", fontSize: "30px" }}>
          Jangan lupa bagikan kebaikan hari ini.
        </p>
      </div>
    </AbsoluteFill>
  );
};
