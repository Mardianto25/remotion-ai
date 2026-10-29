import { 
  AbsoluteFill, 
  Sequence, 
  useCurrentFrame, 
  interpolate, 
  spring, 
  Img, 
  staticFile 
} from "remotion";
import { Audio } from "@remotion/media";
import videoData from "./video-data.json";

export const MultiSceneVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#090d16" }}>
      {/* Backsound Musik Publik */}
      <Audio src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf756.mp3?filename=peaceful-guitar-112901.mp3" volume={0.5} />

      {videoData.map((scene: any, index: number) => {
        const fromFrame = index * 150; // Setiap adegan berdurasi 150 frame (5 detik)
        return (
          <Sequence key={index} from={fromFrame} durationInFrames={150}>
            <DynamicScene title={scene.title} text={scene.text} keyword={scene.keyword} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const DynamicScene = ({ title, text, keyword }: { title: string; text: string; keyword: string }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 150], [1, 1.15], { extrapolateRight: "clamp" });

  // Menggunakan gambar dinamis dari Unsplash berdasarkan keyword dari Gemini AI
  const bgUrl = `https://source.unsplash.com/1080x1920/?${keyword}`;

  return (
    <AbsoluteFill>
      <Img 
        src={bgUrl} 
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
