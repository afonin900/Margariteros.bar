import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { palette } from "./palette";

export type FridayKikeReelProps = {
  photo: string;
  artist: string;
  date: string;
  start: string;
};

export const FridayKikeReel: React.FC<FridayKikeReelProps> = ({ photo, artist, date, start }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // The source's black bars are removed by the fixed crop. Only the background moves.
  const panX = interpolate(frame, [0, 54, 132, durationInFrames - 1], [-36, 16, -8, 30], {
    extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, 54, 132, durationInFrames - 1], [14, -10, 4, -14], {
    extrapolateRight: "clamp",
  });
  const enter = (delay: number) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 18, mass: 0.7, stiffness: 105 },
    });
  const factsIn = enter(10);
  const artistIn = enter(18);
  const startIn = enter(40);

  return (
    <AbsoluteFill style={{ background: palette.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile(photo)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // 67% drops both black bars from the original portrait photo.
            objectPosition: "50% 67%",
            transform: `scale(1.11) translate(${panX}px, ${panY}px)`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(11,11,11,0.48) 0%, rgba(11,11,11,0.04) 35%, rgba(11,11,11,0.10) 57%, rgba(11,11,11,0.86) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 46,
          border: `3px solid ${palette.lime}`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          bottom: 348,
          color: palette.cream,
          textShadow: "0 3px 20px rgba(0,0,0,0.55)",
        }}
      >
        <p
          style={{
            margin: "0 0 18px",
            color: palette.orange,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 46,
            fontWeight: 850,
            letterSpacing: "0.08em",
            opacity: factsIn,
            transform: `translateY(${(1 - factsIn) * 20}px)`,
          }}
        >
          PIĄTEK · {date}
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 116,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 0.9,
            textTransform: "uppercase",
            opacity: artistIn,
            transform: `translateY(${(1 - artistIn) * 28}px)`,
          }}
        >
          {artist}
        </h1>
        <p
          style={{
            margin: "24px 0 0",
            color: palette.lime,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 48,
            fontWeight: 850,
            letterSpacing: "0.04em",
            opacity: startIn,
            transform: `translateY(${(1 - startIn) * 18}px)`,
          }}
        >
          START {start}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const GoogleBusinessKikeVideo: React.FC<Pick<FridayKikeReelProps, "photo" | "artist">> = ({
  photo,
  artist,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const panX = interpolate(frame, [0, durationInFrames - 1], [-22, 22], {
    extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, durationInFrames - 1], [10, -8], {
    extrapolateRight: "clamp",
  });
  const titleIn = spring({
    frame: frame - 12,
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 110 },
  });

  return (
    <AbsoluteFill style={{ background: palette.ink, overflow: "hidden" }}>
      <Img
        src={staticFile(photo)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 40%",
          transform: `scale(1.12) translate(${panX}px, ${panY}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(11,11,11,0.42) 0%, rgba(11,11,11,0.02) 42%, rgba(11,11,11,0.80) 100%)",
        }}
      />
      <div style={{ position: "absolute", inset: 36, border: `3px solid ${palette.lime}` }} />
      <h1
        style={{
          position: "absolute",
          left: 72,
          bottom: 82,
          margin: 0,
          color: palette.cream,
          fontFamily: "Montserrat, sans-serif",
          fontSize: 128,
          fontWeight: 900,
          letterSpacing: "-0.06em",
          lineHeight: 0.9,
          textTransform: "uppercase",
          textShadow: "0 3px 20px rgba(0,0,0,0.55)",
          opacity: titleIn,
          transform: `translateX(${(1 - titleIn) * -64}px)`,
        }}
      >
        {artist}
      </h1>
    </AbsoluteFill>
  );
};
