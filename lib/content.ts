// All copy, prices and image references live here so the client's real content can be swapped in one place.
// Prices are transcribed from the studio's printed menu (PHP). Team, photos and bios are SAMPLE content.

export const studio = {
  name: "AQP Beauty Studio",
  legalName: "AQP Wardrobe Collection / Events – Hair & Make Up Studio",
  address: "Maulion Bldg., ML Quezon Street, Tabing-Dagat, Odiongan",
  phones: [
    { label: "0918 625 3234", href: "tel:+639186253234" },
    { label: "0966 857 2957", href: "tel:+639668572957" },
  ],
  facebook: "https://web.facebook.com/AQPHairandNailCareSalon",
  payments: "GCash and bank transfer",
  notes: ["Home service and after-office appointments, booked ahead."],
};

export type Group = "Hair" | "Nails" | "Brows, lashes & waxing";

export type Service = {
  id: string;
  group: Group;
  name: string;
  variant?: string;
  price: number;
};

let n = 0;
const s = (group: Group, name: string, price: number, variant?: string): Service => ({
  id: `s${++n}`,
  group,
  name,
  variant,
  price,
});

const H: Group = "Hair";
const N: Group = "Nails";
const B: Group = "Brows, lashes & waxing";

export const services: Service[] = [
  s(H, "Men's haircut", 150, "Basic"),
  s(H, "Ladies' haircut", 150, "With style"),
  s(H, "Shampoo and blowdry", 200, "Men"),
  s(H, "Shampoo and blowdry", 350, "Women"),
  s(H, "Hair ironing", 300, "Medium"),
  s(H, "Hair ironing", 500, "Long"),
  s(H, "Hair curling", 300),
  s(H, "Hair perm", 800, "Medium"),
  s(H, "Hair perm", 1500, "Long"),
  s(H, "Hair spa", 1000),
  s(H, "Conditioning treatment", 500, "Men"),
  s(H, "Conditioning treatment", 800, "Women"),
  s(H, "Premium colour, one shade", 500, "Men"),
  s(H, "Premium colour, one shade", 800, "Women, medium"),
  s(H, "Premium colour, one shade", 1200, "Women, long"),
  s(H, "Branded base colour", 800, "Men"),
  s(H, "Branded base colour", 1000, "Women, medium"),
  s(H, "Branded base colour", 1500, "Women, long"),
  s(H, "Full bleach", 1200, "Men"),
  s(H, "Highlights", 1000, "Men"),
  s(H, "Highlights", 1500, "Women, medium"),
  s(H, "Highlights", 2000, "Women, long"),
  s(H, "Balayage", 3500, "Medium"),
  s(H, "Balayage", 4500, "Long"),
  s(H, "Hair rebond", 800, "Men"),
  s(H, "Hair rebond", 1500, "Women, medium"),
  s(H, "Hair rebond", 2000, "Women, long"),
  s(H, "Brazilian blowout", 1000, "Medium"),
  s(H, "Brazilian blowout", 1500, "Long"),
  s(H, "Keratin treatment", 1500, "Medium"),
  s(H, "Keratin treatment", 2000, "Long"),
  s(H, "Kerabond treatment", 2000, "Medium"),
  s(H, "Kerabond treatment", 2500, "Long"),
  s(N, "Manicure", 100, "Basic cleaning"),
  s(N, "Pedicure", 120, "Basic cleaning"),
  s(N, "Pedicure", 150, "With ingrown removal"),
  s(N, "Gel polish", 400),
  s(N, "Gel polish removal", 100),
  s(N, "Nail extension", 600, "Basic design"),
  s(N, "Nail extension", 800, "Nail art inspo"),
  s(N, "Nail extension removal", 250),
  s(N, "Foot spa", 500),
  s(N, "Foot massage", 200),
  s(B, "Eyebrow shaving", 60),
  s(B, "Eyebrow threading", 120),
  s(B, "Waxing", 150, "Upper and lower lip"),
  s(B, "Waxing", 200, "Underarm"),
  s(B, "Waxing", 250, "Legs"),
  s(B, "Waxing", 400, "Full legs"),
  s(B, "Eyelash extension", 500, "Medium"),
  s(B, "Eyelash extension", 600, "Full"),
  s(B, "Eyelash extension removal", 100),
];

export const groups: Group[] = ["Hair", "Nails", "Brows, lashes & waxing"];

export const peso = (v: number) => `₱${v.toLocaleString("en-PH")}`;

export type Photo = { src: string; w: number; h: number; alt: string };

const p = (file: string, w: number, h: number, alt: string): Photo => ({
  src: `/photos/${file}.jpg`,
  w,
  h,
  alt,
});

export const photos = {
  hairColour: p("hair-colour-mirror-lights", 1800, 2700, "A stylist applying colour to a client's hair in front of a mirror lined with bulbs"),
  candle: p("candlelit-mirror", 1800, 2700, "An ornate mirror lit by candles in a dark room"),
  blonde: p("blonde-portrait", 1800, 2250, "A woman with long highlighted hair and dramatic makeup"),
  braid: p("braid-hair", 1800, 2700, "Long blonde hair with a woven braid, seen from behind"),
  bwHair: p("bw-hair-portrait", 1800, 2250, "Black and white portrait of a woman with long wavy hair"),
  bwLong: p("bw-long-hair", 1800, 2700, "Black and white portrait of a woman with very long hair"),
  bwMakeup: p("bw-makeup-artist", 1800, 2700, "A makeup artist working on a client before an event, in black and white"),
  chandelier: p("chandelier", 1800, 2400, "Crystal chandeliers glowing in a dark room"),
  nailsGold: p("nails-gold-satin", 1800, 2198, "A hand with red almond nails resting on gold satin"),
  nailsDark: p("nails-dark", 1800, 2700, "A hand with long pink nails and a ring against a dark background"),
  lashApply: p("lash-extension", 1800, 2700, "A lash artist applying extensions to a client lying back"),
  barber: p("barber-bw", 1600, 2399, "A barber laughing with a client in the chair, in black and white, mirror bulbs behind"),
  stylistMirror: p("stylist-mirror", 1600, 2400, "A stylist in an apron seated beside a mirror lined with bulbs"),
  scissors: p("scissors-cut", 1600, 2400, "Hands cutting a length of hair with scissors and a comb"),
  brow: p("brow-shaping", 1600, 1067, "A close-up of a woman's brow being shaped with tweezers"),
  stylistChair: p("stylist-chair", 1600, 2400, "A stylist with long blonde hair seated on a salon chair"),
  mensCut: p("mens-cut", 1600, 2400, "A man in a black cape after a fade haircut against a brick wall"),
  lashTweezers: p("lash-tweezers", 1800, 1200, "Close-up of eyelash extensions being placed with tweezers"),
};

// Recent work: one row of portrait cards.
export const strip: { photo: Photo; title: string; tag: string }[] = [
  { photo: photos.bwHair, title: "Long layers", tag: "Hair" },
  { photo: photos.nailsDark, title: "Almond nails", tag: "Nails" },
  { photo: photos.braid, title: "Woven braid", tag: "Hair" },
  { photo: photos.candle, title: "Evening light", tag: "The studio" },
  { photo: photos.hairColour, title: "Colour at the mirror", tag: "Colour" },
  { photo: photos.lashApply, title: "Lash extensions", tag: "Lashes" },
  { photo: photos.blonde, title: "Highlights", tag: "Colour" },
  { photo: photos.nailsGold, title: "Gel and gold", tag: "Nails" },
  { photo: photos.barber, title: "Fades and clippers", tag: "Barber" },
  { photo: photos.bwMakeup, title: "Event makeup", tag: "Makeup" },
  { photo: photos.scissors, title: "Precision cuts", tag: "Hair" },
  { photo: photos.brow, title: "Brow shaping", tag: "Brows" },
  { photo: photos.bwLong, title: "Length and shine", tag: "Hair" },
  { photo: photos.chandelier, title: "Chandelier hour", tag: "The studio" },
];

const from = (g: Group) => Math.min(...services.filter((x) => x.group === g).map((x) => x.price));

// The four doors into the services; each links to its price list (or, for events, to a quote).
export const categories = [
  {
    id: "hair",
    title: "Hair",
    tag: `From ${peso(from("Hair"))}`,
    line: "Cuts, colour, balayage and smoothing treatments, from a quick trim to a full balayage.",
    cta: "See hair prices",
    href: "#services-hair",
    photo: photos.hairColour,
  },
  {
    id: "nails",
    title: "Nails",
    tag: `From ${peso(from("Nails"))}`,
    line: "Gel polish, extensions and nail art, with a foot spa to finish.",
    cta: "See nail prices",
    href: "#services-nails",
    photo: photos.nailsDark,
  },
  {
    id: "lashes",
    title: "Brows and lashes",
    tag: `From ${peso(from("Brows, lashes & waxing"))}`,
    line: "Threading, waxing and lash extensions in medium or full sets.",
    cta: "See brow and lash prices",
    href: "#services-brows",
    photo: photos.lashApply,
  },
  {
    id: "events",
    title: "Events and bridal",
    tag: "Quoted per booking",
    line: "Hair and makeup for weddings, debuts and nights out. Tell us the date and we plan the look.",
    cta: "Request a quote",
    href: "#book",
    photo: photos.bwMakeup,
  },
];

// What is true of every visit, taken from the studio's own price list.
export const promises = [
  { title: "We come to you", text: "Home service is available. Tick it when you book." },
  { title: "After office hours", text: "Appointments after work are available. Book ahead." },
  { title: "Prices up front", text: "Every service on the printed menu is priced here, in pesos." },
  { title: "Pay your way", text: `We accept ${studio.payments}.` },
];

// SAMPLE team: replace names, roles, bios and portraits with the real staff.
export const team = [
  {
    name: "Aira Quinto",
    role: "Creative director, colour",
    bio: "Leads every colour consultation. Balayage and blonding are her signature, and she will tell you honestly what your hair can take.",
    photo: photos.stylistChair,
  },
  {
    name: "Mika Dela Cruz",
    role: "Makeup artist, events and bridal",
    bio: "Plans a bride's look from the first trial to the last touch-up, and works with natural skin before anything else.",
    photo: photos.bwMakeup,
  },
  {
    name: "Rhea Montalban",
    role: "Hair stylist",
    bio: "Cuts, curls, rebonding and keratin. She is the one clients ask for by name when they have a wedding to attend.",
    photo: photos.stylistMirror,
  },
  {
    name: "Jomar Fabella",
    role: "Barber, men's cuts and fades",
    bio: "Clean fades, sharp tapers and beard work, with a hot towel to finish. Walk in with a photo and he will match it.",
    photo: photos.barber,
  },
];
