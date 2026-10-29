import { Composition } from "remotion";
import { MultiSceneVideo } from "./MultiSceneVideo";

export const Root = () => {
  return (
    <Composition
      id="MultiSceneVideo"
      component={MultiSceneVideo}
      durationInFrames={450} // Total durasi 15 detik (30 fps x 15 detik)
      fps={30}
      width={1080}
      height={1920} // Rasio vertikal 9:16 untuk Reels/TikTok/Shorts
    />
  );
};
