      <Background />
      {SCENES.map((scene, i) => {
        const seq = (
          <Sequence
            key={i}
            from={from}
            durationInFrames={scene.duration}
            name={`Adegan ${i + 1}`}
          >
            <Scene config={scene} />
          </Sequence>
        );
        from += scene.duration;
        return seq;
      })}
    </AbsoluteFill>
  );
};

/* ============================================================
 * 7. ROOT: mendaftarkan komposisi ke Remotion
 * ============================================================ */

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Renungan"
      component={RenunganVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
