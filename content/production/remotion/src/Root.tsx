import "./index.css";
import { Composition } from "remotion";
import { FridayKikeReel, GoogleBusinessKikeVideo } from "./FridayKikeReel";
import { JoylandReel } from "./JoylandReel";
import { JoylandGbpPoster } from "./JoylandGbpPoster";
import { SaturdayReel, type SaturdayReelProps } from "./SaturdayReel";

const defaultProps: SaturdayReelProps = {
  photo: "dj-dragon-hero.jpg",
  photoPosition: "50% 42%",
  dates: "22.08",
  artist: "DJ DRAGÓN",
  start: "21:00",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SaturdayDragon"
        component={SaturdayReel}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="FridayKike"
        component={FridayKikeReel}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          photo: "dj-kike-hero.cleaned.jpg",
          artist: "DJ Kike",
          date: "28.08",
          start: "21:00",
        }}
      />
      <Composition
        id="GoogleBusinessKike"
        component={GoogleBusinessKikeVideo}
        durationInFrames={210}
        fps={30}
        width={1200}
        height={900}
        defaultProps={{ photo: "dj-kike-hero.cleaned.jpg", artist: "DJ Kike" }}
      />
      <Composition
        id="SaturdayJoyland"
        component={JoylandReel}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="GoogleBusinessJoyland"
        component={JoylandGbpPoster}
        durationInFrames={1}
        fps={30}
        width={1200}
        height={900}
      />
    </>
  );
};
