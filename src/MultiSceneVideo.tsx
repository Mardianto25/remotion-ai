// import { 
//   AbsoluteFill, 
//   Sequence, 
//   useCurrentFrame, 
//   interpolate, 
//   Img, 
//   staticFile 
// } from "remotion";
// import { Audio } from "@remotion/media";
// import subtitles from "./subtitles.json";

// export const MultiSceneVideo = () => {
//   const defaultAudio = staticFile("audio.mp3");
//   const fps = 30;

//   return (
//     <AbsoluteFill style={{ backgroundColor: "#090d16", overflow: "hidden" }}>
//       {defaultAudio ? (
//         <Audio src={defaultAudio} volume={0.8} />
//       ) : null}

//       {subtitles.map((sub: any, index: number) => {
//         const startFrame = Math.floor(sub.start * fps);
//         const endFrame = Math.ceil(sub.end * fps);
//         const durationInFrames = Math.max(endFrame - startFrame, 45); 

//         return (
//           <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
//             <SlideThematicScene text={sub.text} imageUrl={sub.image} index={index} />
//           </Sequence>
//         );
//       })}
//     </AbsoluteFill>
//   );
// };

// const SlideThematicScene = ({ text, imageUrl, index }: { text: string; imageUrl: string; index: number }) => {
//   const frame = useCurrentFrame();
  
//   // Menentukan arah geser bergantian (genap geser dari kanan ke kiri, ganjil dari kiri ke kanan)
//   const isEven = index % 2 === 0;
  
//   // Animasi posisi geser (Slide) yang mulus di awal adegan tanpa efek opacity/fade
//   const translateX = interpolate(
//     frame, 
//     [0, 25], 
//     [isEven ? 120 : -120, 0], // Bergeser masuk dari samping ke posisi tengah (0)
//     { extrapolateRight: "clamp" }
//   );

//   // Animasi pergeseran halus pada gambar (efek geser perlahan / pan & drift)
//   const imageTranslateX = interpolate(
//     frame,
//     [0, 90],
//     [isEven ? -30 : 30, isEven ? 30 : -30],
//     { extrapolateRight: "clamp" }
//   );

//   const safeImageUrl = imageUrl || "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";

//   return (
//     <AbsoluteFill style={{ overflow: "hidden" }}>
//       {/* Background Gambar dengan Efek Geser Perlahan (Pan & Drift) */}
//       <Img 
//         src={safeImageUrl} 
//         style={{ 
//           width: "110%", 
//           height: "110%", 
//           objectFit: "cover", 
//           transform: `translateX(${imageTranslateX}px)`, 
//           filter: "brightness(0.35)" 
//         }} 
//       />

//       {/* Teks Subtitle dengan Efek Geser Samping yang Sinematik */}
//       <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}>
//         <div style={{ transform: `translateX(${translateX}px)`, textAlign: "center" }}>
//           <p style={{ 
//             color: "#ffffff", 
//             fontSize: "44px", 
//             lineHeight: "1.5", 
//             fontWeight: "bold", 
//             textShadow: "0 4px 15px rgba(0,0,0,0.9)",
//             backgroundColor: "rgba(0, 0, 0, 0.45)",
//             padding: "20px 30px",
//             borderRadius: "16px"
//           }}>
//             "{text}"
//           </p>
//         </div>
//       </AbsoluteFill>
//     </AbsoluteFill>
//   );
// };

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
    <AbsoluteFill style={{ backgroundColor: "#121824", overflow: "hidden" }}>
      {defaultAudio ? (
        <Audio src={defaultAudio} volume={0.8} />
      ) : null}

      {subtitles.map((sub: any, index: number) => {
        const startFrame = Math.floor(sub.start * fps);
        const endFrame = Math.ceil(sub.end * fps);
        
        // Menambahkan durasi ekstra (+15 frame) agar scene berikutnya overlap dan bebas kedlapan hitam
        const durationInFrames = Math.max((endFrame - startFrame) + 15, 45); 

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
            <SlideThematicScene text={sub.text} imageUrl={sub.image} index={index} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SlideThematicScene = ({ text, imageUrl, index }: { text: string; imageUrl: string; index: number }) => {
  const frame = useCurrentFrame();
  
  // Menentukan arah geser bergantian (genap dari kanan, ganjil dari kiri)
  const isEven = index % 2 === 0;
  
  // Animasi geser teks masuk ke tengah
  const translateX = interpolate(
    frame, 
    [0, 25], 
    [isEven ? 120 : -120, 0], 
    { extrapolateRight: "clamp" }
  );

  // Animasi pergeseran halus pada gambar (pan & drift)
  const imageTranslateX = interpolate(
    frame,
    [0, 90],
    [isEven ? -30 : 30, isEven ? 30 : -30],
    { extrapolateRight: "clamp" }
  );

  // Efek fade-in kilat (0-5 frame) khusus gambar untuk menghilangkan jeda/kedlapan hitam saat memuat URL
  const imageOpacity = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });

  const safeImageUrl = imageUrl || "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Background Gambar dengan Fade-in kilat & pergeseran halus */}
      <Img 
        src={safeImageUrl} 
        style={{ 
          width: "110%", 
          height: "110%", 
          objectFit: "cover", 
          transform: `translateX(${imageTranslateX}px)`, 
          filter: "brightness(0.35)",
          opacity: imageOpacity 
        }} 
      />

      {/* Teks Subtitle dengan Efek Geser Samping */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}>
        <div style={{ transform: `translateX(${translateX}px)`, textAlign: "center" }}>
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
