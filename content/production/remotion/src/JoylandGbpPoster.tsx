import { AbsoluteFill, Img, staticFile } from "remotion";
import { palette } from "./palette";

export const JoylandGbpPoster: React.FC = () => (
  <AbsoluteFill style={{ background: palette.ink, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 660,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("dj-joyland-source.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "51% 47%",
          transform: "scale(1.08)",
        }}
      />
    </div>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(90deg, #0B0B0B 0%, #0B0B0B 38%, rgba(11,11,11,0.8) 49%, rgba(11,11,11,0) 67%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 74,
        left: 74,
        width: 10,
        height: 362,
        background: palette.lime,
      }}
    />
    <div style={{ position: "absolute", left: 112, top: 82, width: 540, color: palette.cream }}>
      <p
        style={{
          margin: 0,
          color: palette.lime,
          fontFamily: "Montserrat, sans-serif",
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: "0.14em",
        }}
      >
        SOBOTA · 29.08
      </p>
      <h1
        style={{
          margin: "36px 0 0",
          fontFamily: "Montserrat, sans-serif",
          fontSize: 86,
          fontWeight: 900,
          fontStyle: "italic",
          letterSpacing: "-0.07em",
          lineHeight: 0.82,
          textTransform: "uppercase",
        }}
      >
        DJ
        <br />
        JOYLAND
      </h1>
      <p
        style={{
          margin: "42px 0 0",
          color: palette.orange,
          fontFamily: "Montserrat, sans-serif",
          fontSize: 42,
          fontWeight: 900,
          letterSpacing: "-0.03em",
        }}
      >
        START 21:00
      </p>
      <p
        style={{
          margin: "16px 0 0",
          fontFamily: "Montserrat, sans-serif",
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "0.06em",
        }}
      >
        MARGARITEROS
      </p>
    </div>
  </AbsoluteFill>
);
