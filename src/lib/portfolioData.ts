export type PortfolioCategory = "portrait" | "wedding" | "event" | "product";

export type PortfolioImage = {
  id: string;
  src: string;
  alt: string;
  category: PortfolioCategory;
};

const u = (id: string) => `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`;

export const portfolioImages: PortfolioImage[] = [
  { id: "p1", src: u("photo-1554080353-a576cf803bda"), alt: "Black and white studio portrait with dramatic side light", category: "portrait" },
  { id: "p2", src: u("photo-1481277542470-605612bd2d61"), alt: "Editorial outdoor portrait at golden hour", category: "portrait" },
  { id: "p3", src: u("photo-1517841905240-472988babdf9"), alt: "Close-up bridal portrait before the ceremony", category: "wedding" },
  { id: "p4", src: u("photo-1519741497674-611481863552"), alt: "Bride and groom walking through a garden aisle", category: "wedding" },
  { id: "p5", src: u("photo-1529636798458-92182e662485"), alt: "Candid moment of guests laughing at a live event", category: "event" },
  { id: "p6", src: u("photo-1511795409834-ef04bbd61622"), alt: "Corporate conference stage with speaker under lights", category: "event" },
  { id: "p7", src: u("photo-1503342217505-b0a15ec3261c"), alt: "Minimalist still life product photography on a plinth", category: "product" },
  { id: "p8", src: u("photo-1523293182086-7651a899d37f"), alt: "Studio product shot of a leather handbag", category: "product" },
  { id: "p9", src: u("photo-1522673607200-164d1b6ce486"), alt: "Guests dancing at an evening reception", category: "event" },
  { id: "p10", src: u("photo-1520854221256-17451cc331bf"), alt: "Portrait of a woman in natural window light", category: "portrait" },
  { id: "p11", src: u("photo-1465146344425-f00d5f5c8f07"), alt: "Wedding couple silhouetted beneath a stone archway", category: "wedding" },
  { id: "p12", src: u("photo-1560184897-ae75f418493e"), alt: "Flat-lay product photography of skincare bottles", category: "product" },
];

export const categories: { value: PortfolioCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "portrait", label: "Portrait" },
  { value: "wedding", label: "Wedding" },
  { value: "event", label: "Event" },
  { value: "product", label: "Product" },
];
