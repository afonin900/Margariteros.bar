import {
  AbsoluteFill,
  Img,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { palette } from "./palette";

export type SaturdayReelProps = {
  photo: string;
  photoPosition: string;
  dates: string;
  artist: string;
  start: string;
};

export const SaturdayReel: React.FC<SaturdayReelProps> = ({
  photo,
  photoPosition,
  dates,
  artist,
  start,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const photoScale = interpolate(frame, [0, durationInFrames - 1], [1, 1.16], {
    extrapolateRight: "clamp",
  });

  const enter = (delay: number) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 16, mass: 0.7, stiffness: 120 },
    });

  const datesIn = enter(8);
  const nameIn = enter(16);
  const startIn = enter(26);
  const barIn = enter(20);

  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI);
  const dateColor = interpolateColors(pulse, [0, 1], [palette.lime, palette.orange]);
  const timeColor = interpolateColors(pulse, [0, 1], [palette.orange, palette.lime]);

  return (
    <AbsoluteFill style={{ background: palette.ink }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile(photo)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: photoPosition,
            transform: `scale(${photoScale})`,
            transformOrigin: "50% 38%",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(11,11,11,0.16) 0%, rgba(11,11,11,0) 24%, rgba(11,11,11,0.14) 50%, rgba(11,11,11,0.62) 78%, rgba(11,11,11,0.8) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 268,
          fontFamily: "Montserrat, sans-serif",
          color: palette.white,
          textShadow: "0 2px 18px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            width: 72 * barIn,
            height: 8,
            marginBottom: 22,
            background: palette.lime,
            borderRadius: 99,
            opacity: barIn,
          }}
        />

        <p
          style={{
            margin: "0 0 10px",
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: "0.01em",
            lineHeight: 1.1,
            color: dateColor,
            opacity: datesIn,
            transform: `translateY(${(1 - datesIn) * 18}px)`,
          }}
        >
          {dates}
        </p>

        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 110,
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: palette.white,
            opacity: nameIn,
            transform: `translateY(${(1 - nameIn) * 22}px)`,
          }}
        >
          {artist}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: startIn,
            transform: `translateY(${(1 - startIn) * 16}px)`,
          }}
        >
          <Img
            src={staticFile("lf_icon_music_note.png")}
            style={{
              width: 72,
              height: 72,
              objectFit: "contain",
              flex: "0 0 auto",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "0.01em",
              lineHeight: 1.05,
              textTransform: "uppercase",
              color: palette.cream,
            }}
          >
            START{" "}
            <span style={{ color: timeColor }}>{start}</span>
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
