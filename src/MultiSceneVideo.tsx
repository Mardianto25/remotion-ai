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
  // Menangani audio default secara aman (pastikan ada file audio.mp3 di folder public, atau lewati jika kosong)
  const defaultAudio = staticFile("audio.mp3");

  return (
    <AbsoluteFill style={{ backgroundColor: "#090d16" }}>
      {/* Audio dengan pengecekan aman */}
      {defaultAudio ? (
        <Audio src={defaultAudio} volume={0.5} />
      ) : null}

      {videoData.map((scene: any, index: number) => {
        const fromFrame = index * 150; 
        return (
          <Sequence key={index} from={fromFrame} durationInFrames={150}>
            <DynamicScene title={scene.title} text={scene.text} imageUrl={scene.image} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const DynamicScene = ({ title, text, imageUrl }: { title: string; text: string; imageUrl: string }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 150], [1, 1.15], { extrapolateRight: "clamp" });

  // Fallback gambar default jika imageUrl kosong
  const safeImageUrl = imageUrl || "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";

  return (
    <AbsoluteFill>
      <Img 
        src={safeImageUrl} 
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})`, filter: "brightness(0.4)" }} 
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
        <div style={{ opacity, textAlign: "center" }}>
          <h1 style={{ color: "#ffffff", fontSize: "56px", fontWeight: "bold", marginBottom: "20px", textShadow: "0 4px 10px rgba(0,0,0,0.8)" }}>
            {title}
          </h1>
          <p style={{ color: "#38bdf8", fontSize: "32px", lineHeight: "1.4", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
            "{text}"
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
