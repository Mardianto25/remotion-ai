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
      {/* Memutar audio latar secara penuh */}
      {defaultAudio ? (
        <Audio src={defaultAudio} volume={0.8} />
      ) : null}

      {/* Render teks/subtitle secara dinamis berdasarkan waktu dari audio */}
      {subtitles.map((sub: any, index: number) => {
        const startFrame = Math.floor(sub.start * fps);
        const endFrame = Math.ceil(sub.end * fps);
        const durationInFrames = Math.max(endFrame - startFrame, 30); // Minimal 1 detik per teks

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
            <SubtitleScene text={sub.text} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SubtitleScene = ({ text }: { text: string }) => {
  const frame = useCurrentFrame();
  
  // Efek animasi muncul yang mulus untuk setiap potongan teks
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 30], [0.95, 1], { extrapolateRight: "clamp" });

  // Gambar latar default/estetik yang konsisten
  const bgUrl = "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";

  return (
    <AbsoluteFill>
      {/* Background Gambar */}
      <Img 
        src={bgUrl} 
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35)" }} 
      />

      {/* Teks Subtitle yang Sinkron dengan Suara */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}>
        <div style={{ opacity, transform: `scale(${scale})`, textAlign: "center" }}>
          <p style={{ 
            color: "#ffffff", 
            fontSize: "44px", 
            lineHeight: "1.5", 
            fontWeight: "bold", 
            textShadow: "0 4px 15px rgba(0,0,0,0.9)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
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
