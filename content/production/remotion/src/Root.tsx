import "./index.css";
import { Composition } from "remotion";
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
    <Composition
      id="SaturdayDragon"
      component={SaturdayReel}
      durationInFrames={210}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
};
