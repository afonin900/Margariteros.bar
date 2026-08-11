import pptxgen from "pptxgenjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, "..");
const logo = path.join(
  pack,
  "canva_upload/01_logos/margariteros-logo-clean.png",
);
const papel = path.join(pack, "canva_upload/04_overlays/papel-picado.png");
const mascot = path.join(pack, "canva_upload/02_brand_accents/mascot-wave.png");

const C = {
  lime: "C6FF00",
  orange: "FF5A2E",
  cream: "FFF5E1",
  ink: "0B0B0B",
  gray: "30352C",
  muted: "CBD2B4",
};
const display = "Barlow Condensed";
const body = "Montserrat";

function setup(layout, width, height, title) {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: layout, width, height });
  pptx.layout = layout;
  pptx.author = "Margariteros Bar";
  pptx.subject = "Editable Canva template";
  pptx.title = title;
  pptx.company = "Margariteros Bar";
  pptx.lang = "pl-PL";
  pptx.theme = { headFontFace: display, bodyFontFace: body, lang: "pl-PL" };
  return pptx;
}

function addPhotoPlaceholder(
  slide,
  x,
  y,
  w,
  h,
  label = "WSTAW PRAWDZIWE ZDJĘCIE",
) {
  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: C.gray },
    line: { color: "596050", width: 1 },
  });
  slide.addText(label, {
    x: x + 0.25,
    y: y + h / 2 - 0.2,
    w: w - 0.5,
    h: 0.4,
    fontFace: body,
    fontSize: 11,
    bold: true,
    color: C.muted,
    align: "center",
    margin: 0,
    breakLine: false,
  });
  slide.addText("CANVA: ZASTĄP PROSTOKĄT RAMKĄ ZDJĘCIA", {
    x: x + 0.25,
    y: y + h - 0.35,
    w: w - 0.5,
    h: 0.18,
    fontFace: body,
    fontSize: 6.5,
    bold: true,
    color: C.muted,
    align: "center",
    margin: 0,
  });
}

function addLogo(slide, x, y, size) {
  slide.addImage({ path: logo, x, y, w: size, h: size });
}

function addFooter(slide, width, y) {
  slide.addShape("line", {
    x: 0.55,
    y,
    w: width - 1.1,
    h: 0,
    line: { color: C.lime, width: 2.5 },
  });
  slide.addText("MARGARITEROS · CHMIELNA 7/9", {
    x: 0.55,
    y: y + 0.12,
    w: width - 1.1,
    h: 0.25,
    fontFace: body,
    fontSize: 8,
    bold: true,
    color: C.cream,
    charSpacing: 1.2,
    margin: 0,
  });
}

async function poster() {
  const pptx = setup("SOCIAL_4_5", 8, 10, "Margariteros — afisza 4:5");
  const s = pptx.addSlide();
  s.background = { color: C.ink };
  addPhotoPlaceholder(s, 0, 0, 8, 6.35);
  s.addImage({ path: papel, x: 0, y: 0, w: 8, h: 1.7, transparency: 8 });
  s.addText("PIĄTEK", {
    x: 0.55,
    y: 5.8,
    w: 1.4,
    h: 0.38,
    fontFace: body,
    fontSize: 11,
    bold: true,
    color: C.cream,
    align: "center",
    valign: "mid",
    margin: 0,
    line: { color: C.cream, width: 1 },
    radius: 0.18,
  });
  s.addText("NAZWA\nWYDARZENIA", {
    x: 0.55,
    y: 6.45,
    w: 5.5,
    h: 1.55,
    fontFace: display,
    fontSize: 34,
    bold: true,
    color: C.cream,
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });
  s.addText("DD.MM · GG:MM", {
    x: 5.35,
    y: 7.22,
    w: 2.1,
    h: 0.35,
    fontFace: body,
    fontSize: 13,
    bold: true,
    color: C.orange,
    align: "right",
    margin: 0,
  });
  s.addText("KRÓTKI OPIS / CTA", {
    x: 0.55,
    y: 8.2,
    w: 4.7,
    h: 0.4,
    fontFace: body,
    fontSize: 12,
    bold: true,
    color: C.cream,
    margin: 0,
  });
  addLogo(s, 6.55, 8.05, 0.9);
  addFooter(s, 8, 9.15);
  await pptx.writeFile({
    fileName: path.join(here, "margariteros-afisza-4x5.pptx"),
  });
}

function carouselBase(slide, tone = C.ink) {
  slide.background = { color: tone };
  addLogo(slide, 0.45, 0.42, 0.72);
  slide.addText("MARGARITEROS", {
    x: 1.28,
    y: 0.57,
    w: 3.2,
    h: 0.25,
    fontFace: body,
    fontSize: 9,
    bold: true,
    color: tone === C.cream ? C.ink : C.cream,
    charSpacing: 1.5,
    margin: 0,
  });
}

async function carousel() {
  const pptx = setup("SOCIAL_4_5", 8, 10, "Margariteros — karuzela 4:5");
  let s = pptx.addSlide();
  carouselBase(s, C.lime);
  s.addText("TYDZIEŃ\nW MARGARITEROS", {
    x: 0.55,
    y: 2,
    w: 6.9,
    h: 2.4,
    fontFace: display,
    fontSize: 40,
    bold: true,
    color: C.ink,
    margin: 0,
    fit: "shrink",
  });
  s.addText("PRZESUŃ →", {
    x: 0.55,
    y: 8.6,
    w: 2.2,
    h: 0.35,
    fontFace: body,
    fontSize: 12,
    bold: true,
    color: C.ink,
    margin: 0,
  });

  for (const [day, title] of [
    ["PONIEDZIAŁEK", "OFERTA / SMAK"],
    ["PIĄTEK", "NAZWA WYDARZENIA"],
  ]) {
    s = pptx.addSlide();
    carouselBase(s);
    addPhotoPlaceholder(s, 0, 0, 8, 7.15);
    s.addText(day, {
      x: 0.55,
      y: 6.55,
      w: 2.2,
      h: 0.38,
      fontFace: body,
      fontSize: 10,
      bold: true,
      color: C.cream,
      align: "center",
      margin: 0,
      line: { color: C.cream, width: 1 },
    });
    s.addText(title, {
      x: 0.55,
      y: 7.35,
      w: 6.9,
      h: 1.15,
      fontFace: display,
      fontSize: 29,
      bold: true,
      color: C.cream,
      margin: 0,
      fit: "shrink",
    });
    s.addText("SZCZEGÓŁ / DD.MM · GG:MM", {
      x: 0.55,
      y: 8.65,
      w: 5.5,
      h: 0.35,
      fontFace: body,
      fontSize: 11,
      bold: true,
      color: C.orange,
      margin: 0,
    });
  }

  s = pptx.addSlide();
  carouselBase(s, C.cream);
  s.addText("CO · GDZIE\nKIEDY", {
    x: 0.55,
    y: 1.75,
    w: 6.9,
    h: 1.7,
    fontFace: display,
    fontSize: 39,
    bold: true,
    color: C.ink,
    margin: 0,
  });
  for (const [label, y] of [
    ["CO: MISSING", 4],
    ["GDZIE: CHMIELNA 7/9", 5],
    ["KIEDY: MISSING", 6],
    ["WARUNKI: MISSING", 7],
  ])
    s.addText(label, {
      x: 0.55,
      y,
      w: 6.9,
      h: 0.4,
      fontFace: body,
      fontSize: 14,
      bold: true,
      color: C.ink,
      margin: 0,
      line: {
        color: "D6CCB5",
        width: 1,
        beginArrowType: "none",
        endArrowType: "none",
      },
    });

  s = pptx.addSlide();
  carouselBase(s, C.orange);
  s.addText("REZERWUJ\nSTOLIK", {
    x: 0.55,
    y: 2.1,
    w: 6.9,
    h: 1.8,
    fontFace: display,
    fontSize: 45,
    bold: true,
    color: C.ink,
    margin: 0,
  });
  s.addText("LINK CHOICEQR", {
    x: 0.55,
    y: 5.1,
    w: 3.1,
    h: 0.5,
    fontFace: body,
    fontSize: 15,
    bold: true,
    color: C.ink,
    margin: 0,
  });
  s.addImage({ path: mascot, x: 5.1, y: 6.4, w: 2.1, h: 2.1 });
  await pptx.writeFile({
    fileName: path.join(here, "margariteros-karuzela-5-slajdow.pptx"),
  });
}

async function story() {
  const pptx = setup("STORY_9_16", 7.5, 13.333, "Margariteros — Story 9:16");
  const s = pptx.addSlide();
  s.background = { color: C.ink };
  addPhotoPlaceholder(s, 0, 0, 7.5, 8.8, "WSTAW FOTO LUB WIDEO 9:16");
  s.addImage({ path: papel, x: 0, y: 0.2, w: 7.5, h: 1.55, transparency: 8 });
  s.addText("DD.MM · GG:MM", {
    x: 0.55,
    y: 9.25,
    w: 2.7,
    h: 0.35,
    fontFace: body,
    fontSize: 12,
    bold: true,
    color: C.orange,
    margin: 0,
  });
  s.addText("NAZWA\nWYDARZENIA", {
    x: 0.55,
    y: 9.8,
    w: 6.35,
    h: 1.55,
    fontFace: display,
    fontSize: 34,
    bold: true,
    color: C.cream,
    margin: 0,
    fit: "shrink",
  });
  s.addShape("rect", {
    x: 0.55,
    y: 11.75,
    w: 2.2,
    h: 0.55,
    fill: { color: C.lime },
    line: { color: C.lime },
  });
  s.addText("REZERWUJ →", {
    x: 0.67,
    y: 11.9,
    w: 1.95,
    h: 0.22,
    fontFace: body,
    fontSize: 10,
    bold: true,
    color: C.ink,
    margin: 0,
    align: "center",
  });
  addLogo(s, 6.05, 11.65, 0.85);
  await pptx.writeFile({
    fileName: path.join(here, "margariteros-story-9x16.pptx"),
  });
}

await poster();
await carousel();
await story();
console.log("Canva-import templates generated");
