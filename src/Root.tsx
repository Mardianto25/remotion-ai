import { Composition } from "remotion";
import { MultiSceneVideo } from "./MultiSceneVideo";
import subtitles from "./subtitles.json";

export const Root = () => {
  // Hitung total durasi otomatis berdasarkan subtitle terakhir (dikonversi ke frame pada 30 FPS)
  const lastSubtitle = subtitles.length > 0 ? subtitles[subtitles.length - 1] : { end: 15 };
  const totalFrames = Math.ceil((lastSubtitle.end || 15) * 30);

  return (
    <Composition
      id="MultiSceneVideo"
      component={MultiSceneVideo}
      durationInFrames={totalFrames > 0 ? totalFrames : 450} // Fallback ke 450 frame (15 detik) jika kosong
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
