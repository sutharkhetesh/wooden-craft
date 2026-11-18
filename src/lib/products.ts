export type ProductPhoto = {
  id: string;
  alt: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  details: string[];
  photos: ProductPhoto[];
};

export const productPhotoUrl = (id: string) =>
  `/images/products/studio/${id}.webp`;

export const products: Product[] = [
  {
    slug: "wooden-desk-organiser",
    name: "The Keepsake Organiser",
    category: "Desk & everyday",
    tagline: "A considered place for the little things.",
    description:
      "A long wooden organiser with sculpted compartments and a contrasting dark lid, finished with a fine square inlay. A quietly distinctive home for the objects you reach for every day.",
    details: [
      "Sculpted compartments in a natural wood interior",
      "Contrasting dark lid with a square metallic inlay",
      "See open, closed and overhead views in the gallery",
    ],
    photos: [
      {
        id: "04",
        alt: "Closed wooden desk organiser with dark lid and square inlay",
      },
      {
        id: "01",
        alt: "Overhead view of the wooden organiser, compartments and separate lid",
      },
      {
        id: "08",
        alt: "Open wooden organiser with circular and rectangular compartments beside its lid",
      },
      { id: "12", alt: "Front view of the closed wooden organiser" },
      {
        id: "13",
        alt: "End angle showing the organiser's wood grain and contrasting lid",
      },
    ],
  },
  {
    slug: "triangular-book-rest",
    name: "The Reading Rest",
    category: "Reading rituals",
    tagline: "Save your place. Make a little space.",
    description:
      "A triangular wooden book rest with broad sloping sides and an open centre. The simple architectural shape brings warmth to a bedside table, reading corner or desk.",
    details: [
      "Triangular silhouette with an open centre",
      "Broad wooden surfaces with visible natural grain",
      "Photographed both on its own and styled with a book",
    ],
    photos: [
      { id: "02", alt: "Triangular wooden book rest with an open centre" },
      {
        id: "05",
        alt: "Side view of the triangular book rest showing natural wood grain",
      },
      { id: "03", alt: "Wooden book rest styled with a book and glasses" },
    ],
  },
  {
    slug: "wooden-quill-holder",
    name: "The Quill Holder",
    category: "Objects & accents",
    tagline: "A small object with plenty of character.",
    description:
      "A turned wooden holder with a rounded base and a slender neck. Its warm grain and glossy surface create a sculptural accent, shown here with a patterned feather.",
    details: [
      "Rounded turned-wood base and narrow neck",
      "Glossy finish that reveals the grain",
      "Four views, including the holder on its own and with a feather",
    ],
    photos: [
      {
        id: "09",
        alt: "Turned wooden quill holder with a tall patterned feather",
      },
      { id: "06", alt: "Close view of the wooden holder without a feather" },
      { id: "07", alt: "Wooden holder beside a patterned feather" },
      {
        id: "10",
        alt: "Full view of the curved patterned feather in its wooden holder",
      },
    ],
  },
  {
    slug: "sculptural-candle-holder",
    name: "The Candle Pedestal",
    category: "Objects & accents",
    tagline: "A warm detail for a quieter corner.",
    description:
      "A sculptural wooden pedestal with a shallow bowl, rounded shoulders and a contrasting dark band. A distinctive piece for a console, shelf or tabletop.",
    details: [
      "Shallow bowl on a turned wooden pedestal",
      "Contrasting dark band and rim",
      "Ask us about dimensions and suitable candle inserts",
    ],
    photos: [
      {
        id: "14",
        alt: "Sculptural wooden candle pedestal with a shallow bowl and a black band",
      },
    ],
  },
];
