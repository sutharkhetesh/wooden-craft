export const services = [
  {
    id: "custom-furniture",
    name: "Custom Furniture",
    tag: "Furniture, with a personal point of view.",
    image: "dining",
    description:
      "From a sculptural dining table to a bed made for your room, create a piece that feels entirely your own.",
    options: "Dimensions, silhouette, joinery, upholstery and finish",
    materials: "Solid oak, teak, walnut, ash and responsibly sourced plywood",
    type: "Dining Table",
  },
  {
    id: "kitchens",
    name: "Kitchens, Considered",
    tag: "A beautiful rhythm to everyday living.",
    image: "kitchen",
    description:
      "Thoughtfully planned kitchens that bring together practical storage, natural materials and effortless everyday use.",
    options: "Layout, cabinet profiles, hardware, countertops and finish",
    materials: "Marine plywood, oak veneer, teak and laminate",
    type: "Kitchen",
  },
  {
    id: "wardrobes",
    name: "Wardrobes & Storage",
    tag: "A place for everything. Beautifully.",
    image: "wardrobe",
    description:
      "Tailored wardrobes and cabinetry that make the most of your space, with details that make daily life a little easier.",
    options:
      "Internal organization, sliding or hinged doors and integrated lighting",
    materials: "Plywood, walnut veneer, oak and engineered wood",
    type: "Wardrobe",
  },
  {
    id: "doors-panels",
    name: "Doors & Wall Panels",
    tag: "Architecture with warmth and character.",
    image: "interior",
    description:
      "Beautiful doors, windows and architectural wall panelling that establish a warm, cohesive language throughout your home.",
    options:
      "Door profiles, window frames, fluting, panel patterns and hardware",
    materials: "Teak, oak, walnut and veneered panels",
    type: "Wall Panel",
  },
  {
    id: "office",
    name: "Office Furniture",
    tag: "Make room for your best work.",
    image: "office",
    description:
      "Desks, shelving and meeting tables designed around the way you work, balancing refined proportions with lasting comfort.",
    options: "Desk dimensions, cable management, storage and workspace layout",
    materials: "Solid ash, oak, walnut and commercial-grade plywood",
    type: "Office Furniture",
  },
  {
    id: "bespoke",
    name: "Bespoke Woodwork",
    tag: "Your imagination. Our starting point.",
    image: "craft",
    description:
      "One-of-a-kind wooden objects, cabinets and interior solutions, developed through a close, collaborative design process.",
    options:
      "Home decor, unusual dimensions, custom details and unique applications",
    materials: "A curated selection of solid woods and veneers",
    type: "Other Custom Work",
  },
];
export const projects = [
  {
    slug: "the-walnut-residence",
    name: "The Walnut Residence",
    category: "Living spaces",
    image: "hero",
    location: "A study in warmth",
    materials: "American walnut, natural linen, brushed brass",
    description:
      "A considered living space where rich walnut textures meet soft linen and generous natural light. An illustrative concept for a home that invites you to slow down.",
    customization:
      "Made-to-measure lounge furniture, low storage and a coordinating solid-wood coffee table.",
    images: ["hero", "interior", "dining"],
  },
  {
    slug: "a-table-for-gathering",
    name: "A Table for Gathering",
    category: "Furniture",
    image: "dining",
    location: "Designed around connection",
    materials: "Solid oak, natural oil finish",
    description:
      "Sculptural legs and a generously proportioned oak tabletop give everyday rituals a beautiful setting. An illustrative dining collection built around the pleasure of gathering.",
    customization:
      "Table length, seating capacity, edge profile and timber finish.",
    images: ["dining", "detail", "interior"],
  },
  {
    slug: "the-quiet-kitchen",
    name: "The Quiet Kitchen",
    category: "Kitchens",
    image: "kitchen",
    location: "Every detail in its place",
    materials: "Oak veneer, marine plywood, natural stone",
    description:
      "Warm cabinet fronts, quiet lines and purposeful storage create a calm backdrop for the busiest room in the house. An illustrative kitchen concept.",
    customization:
      "Cabinet layout, internal fittings, hardware and worktop selection.",
    images: ["kitchen", "wardrobe", "detail"],
  },
  {
    slug: "room-to-unwind",
    name: "Room to Unwind",
    category: "Bedrooms",
    image: "bedroom",
    location: "A softer kind of sanctuary",
    materials: "Walnut veneer, solid teak, linen",
    description:
      "A restful bedroom shaped by tactile materials and simple, elegant proportions. An illustrative concept for custom bedroom furniture.",
    customization:
      "Bed dimensions, headboard profile, bedside storage and wardrobe interiors.",
    images: ["bedroom", "wardrobe", "interior"],
  },
  {
    slug: "work-in-good-company",
    name: "Work in Good Company",
    category: "Workspaces",
    image: "office",
    location: "Space for a fresh perspective",
    materials: "Oak, blackened steel, natural oil",
    description:
      "An inviting workspace with a generous timber desk and purposeful storage. An illustrative concept for a more thoughtful working day.",
    customization:
      "Desktop dimensions, storage configuration and cable management.",
    images: ["office", "dining", "detail"],
  },
  {
    slug: "a-place-for-everything",
    name: "A Place for Everything",
    category: "Bedrooms",
    image: "wardrobe",
    location: "Beautifully organized",
    materials: "Oak veneer, plywood, brass fittings",
    description:
      "A tailored storage concept with a quiet architectural presence, balancing open display with beautifully concealed organization.",
    customization:
      "Door style, interior layout, finishes and integrated lighting.",
    images: ["wardrobe", "bedroom", "detail"],
  },
];
export const types = [
  "Bed",
  "Wardrobe",
  "Dining Table",
  "Kitchen",
  "Door",
  "Cabinet",
  "Office Furniture",
  "Wall Panel",
  "Other Custom Work",
] as const;
