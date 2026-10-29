import { 
  AbsoluteFill, 
  Sequence, 
  useCurrentFrame, 
  interpolate, 
  Img, 
  staticFile 
} from "remotion";
import { Audio } from "@remotion/media";
import subtitles from "./subtitles.json";

export const MultiSceneVideo = () => {
  const defaultAudio = staticFile("audio.mp3");
  const fps = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: "#090d16" }}>
      {defaultAudio ? (
        <Audio src={defaultAudio} volume={0.8} />
      ) : null}

      {subtitles.map((sub: any, index: number) => {
        const startFrame = Math.floor(sub.start * fps);
        const endFrame = Math.ceil(sub.end * fps);
        // Kita beri sedikit tambahan durasi (buffer) agar transisi antar scene bisa saling tumpang tindih (crossfade)
        const durationInFrames = Math.max(endFrame - startFrame, 45); 

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
            <SmoothThematicScene text={sub.text} imageUrl={sub.image} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SmoothThematicScene = ({ text, imageUrl }: { text: string; imageUrl: string }) => {
  const frame = useCurrentFrame();
  
  // Animasi Opacity yang halus (Fade In di awal 15 frame, Fade Out di 15 frame terakhir)
  const opacity = interpolate(
    frame, 
    [0, 15, 75, 90], // Sesuaikan titik transisi
    [0, 1, 1, 0], 
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Efek Zoom Halus (Ken Burns Effect) dari skala 1.0 ke 1.12 sepanjang adegan
  const scale = interpolate(frame, [0, 90], [1.0, 1.12], { extrapolateRight: "clamp" });

  const safeImageUrl = imageUrl || "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background Gambar dengan Animasi Zoom & Fade yang Mulus */}
      <Img 
        src={safeImageUrl} 
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "cover", 
          transform: `scale(${scale})`, 
          filter: "brightness(0.35)" 
        }} 
      />

      {/* Subtitle Teks dengan Efek Muncul yang Lembut */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ 
            color: "#ffffff", 
            fontSize: "44px", 
            lineHeight: "1.5", 
            fontWeight: "bold", 
            textShadow: "0 4px 15px rgba(0,0,0,0.9)",
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            padding: "20px 30px",
            borderRadius: "16px"
          }}>
            "{text}"
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
