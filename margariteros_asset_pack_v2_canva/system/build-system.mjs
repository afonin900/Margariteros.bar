import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const markerSets = [
  {
    color: "lime",
    source: "brush-lime-source.png",
    width: 1536,
    height: 501,
    left: 420,
    center: 696,
    right: 420,
  },
  {
    color: "orange",
    source: "brush-orange-source.png",
    width: 1517,
    height: 436,
    left: 420,
    center: 677,
    right: 420,
  },
];

function magick(...args) {
  execFileSync("magick", args, { stdio: "inherit" });
}

for (const set of markerSets) {
  const input = join(root, "sources", set.source);
  const output = join(root, "marker_components", set.color);
  mkdirSync(output, { recursive: true });

  magick(
    input,
    "-crop",
    `${set.left}x${set.height}+0+0`,
    "+repage",
    join(output, "marker-left.png"),
  );
  magick(
    input,
    "-crop",
    `${set.center}x${set.height}+${set.left}+0`,
    "+repage",
    join(output, "marker-center-stretch.png"),
  );
  magick(
    input,
    "-crop",
    `${set.right}x${set.height}+${set.left + set.center}+0`,
    "+repage",
    join(output, "marker-right.png"),
  );
  magick(input, "-strip", join(output, "marker-crop-master.png"));
}

console.log("Margariteros Canva marker components rebuilt.");
