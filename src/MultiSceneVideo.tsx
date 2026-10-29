import { 
  AbsoluteFill, 
  Sequence, 
  useCurrentFrame, 
  interpolate, 
  Img, 
  staticFile 
} from "remotion";
import { Audio } from "@remotion/media";
import videoData from "./video-data.json";

export const MultiSceneVideo = () => {
  const defaultAudio = staticFile("audio.mp3");

  return (
    <AbsoluteFill style={{ backgroundColor: "#090d16" }}>
      {/* Memutar audio latar secara penuh */}
      {defaultAudio ? (
        <Audio src={defaultAudio} volume={0.7} />
      ) : null}

      {/* Render adegan secara dinamis berdasarkan data JSON dari AI */}
      {videoData.map((scene: any, index: number) => {
        const fps = 30;
        const durationPerScene = 150; // 5 detik per adegan (bisa disesuaikan dengan panjang audio)
        const fromFrame = index * durationPerScene; 

        return (
          <Sequence key={index} from={fromFrame} durationInFrames={durationPerScene}>
            <SyncedScene title={scene.title} text={scene.text} imageUrl={scene.image} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SyncedScene = ({ title, text, imageUrl }: { title: string; text: string; imageUrl: string }) => {
  const frame = useCurrentFrame();
  
  // Efek animasi masuk teks dan gambar (Fade in & Zoom)
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 150], [1, 1.15], { extrapolateRight: "clamp" });

  // Fallback gambar aman jika URL kosong
  const safeImageUrl = imageUrl || "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";

  return (
    <AbsoluteFill>
      {/* Background Gambar Estetik */}
      <Img 
        src={safeImageUrl} 
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})`, filter: "brightness(0.35)" }} 
      />

      {/* Konten Teks / Subtitle yang Sinkron */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
        <div style={{ opacity, textAlign: "center" }}>
          <h1 style={{ color: "#ffffff", fontSize: "52px", fontWeight: "bold", marginBottom: "25px", textShadow: "0 4px 12px rgba(0,0,0,0.9)" }}>
            {title}
          </h1>
          <p style={{ color: "#38bdf8", fontSize: "36px", lineHeight: "1.4", fontWeight: "600", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>
            "{text}"
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
