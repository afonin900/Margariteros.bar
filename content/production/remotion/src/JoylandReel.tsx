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

export const JoylandReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = (delay: number) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 20, mass: 0.65, stiffness: 130 },
    });
  const photoScale = interpolate(frame, [0, 210], [1.03, 1.08], { extrapolateRight: "clamp" });
  const photoY = interpolate(frame, [0, 210], [0, -20], { extrapolateRight: "clamp" });
  const eyebrowIn = enter(4);
  const titleIn = enter(38);
  const factsIn = enter(106);

  return (
    <AbsoluteFill style={{ background: palette.ink, overflow: "hidden" }}>
      <Img
        src={staticFile("dj-joyland-source.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "57% 49%",
          transform: `scale(${photoScale}) translateY(${photoY}px)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 320,
          left: 92,
          color: palette.lime,
          fontFamily: "Montserrat, sans-serif",
          fontSize: 46,
          fontWeight: 900,
          letterSpacing: "0.16em",
          textShadow: "0 3px 15px rgba(0,0,0,0.85)",
          opacity: eyebrowIn,
          transform: `translateY(${(1 - eyebrowIn) * -28}px)`,
        }}
      >
        SOBOTA · 29.08
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 876,
          width: 840,
          color: palette.cream,
          textShadow: "0 4px 22px rgba(0,0,0,0.82)",
          opacity: titleIn,
          transform: `translateX(${(1 - titleIn) * -90}px)`,
        }}
      >
        <p
          style={{
            margin: "0 0 18px",
            color: palette.orange,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: "0.12em",
          }}
        >
          MARGARITEROS
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 126,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: "-0.07em",
            lineHeight: 0.8,
            textTransform: "uppercase",
          }}
        >
          DJ
          <br />
          JOYLAND
        </h1>
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 1150,
          color: palette.lime,
          fontFamily: "Montserrat, sans-serif",
          fontSize: 58,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          textShadow: "0 3px 18px rgba(0,0,0,0.9)",
          opacity: factsIn,
          transform: `translateY(${(1 - factsIn) * 40}px)`,
        }}
      >
        START 21:00
      </div>
    </AbsoluteFill>
  );
};
