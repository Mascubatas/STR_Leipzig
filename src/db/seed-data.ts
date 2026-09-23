export const LEIPZIG_PROPERTY_SEED = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "augustus-loft-leipzig",
  name: "The Augustus Loft Leipzig — Zentrum & Gewandhaus",
  headline: "Luxury 2-Bedroom Designer Apartment in the Historic Heart of Leipzig",
  description: `Experience Leipzig in timeless elegance. Situated in a registered heritage building directly adjacent to Augustusplatz, this freshly renovated 88 m² designer apartment seamlessly blends historic stucco ceilings and herringbone oak parquet with bespoke minimalist luxury.

Whether visiting for a world-class concert at the Gewandhaus, business at the Leipziger Messe, or a cultural getaway exploring the Bach Memorial and Spinnerei art galleries, the Augustus Loft offers tranquility in the middle of vibrant city life. 

Features include a light-flooded salon with views toward the university campus, a fully integrated chef's kitchen with Siemens studioLine appliances and Nespresso bar, a master bedroom facing a serene inner courtyard with a premium 180x200cm boxspring bed, a second bedroom with workstation and queen bed, and a spa bathroom with walk-in Italian rainfall shower.`,
  address: "Grimmaische Str. 18",
  city: "Leipzig",
  postalCode: "04109",
  country: "Germany",
  latitude: "51.3396",
  longitude: "12.3785",
  maxGuests: 4,
  bedrooms: 2,
  beds: 2,
  bathrooms: 1,
  checkInTime: "15:00",
  checkOutTime: "11:00",
  basePriceMinor: 16500, // 165.00 EUR
  cleaningFeeMinor: 6500, // 65.00 EUR
  weekendSurchargeMinor: 2500, // +25.00 EUR on Fri & Sat
  touristTaxRatePercent: 5, // 5% Leipzig Gästetaxe
  minStayNights: 2,
  leadTimeHours: 6,
  isPublished: true,
};

export const SEED_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
    caption: "Spacious open-concept living lounge with heritage stucco ceilings and natural light",
    sortOrder: 1,
    isHero: true,
  },
  {
    url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80",
    caption: "Master bedroom with luxury king-size boxspring bed and courtyard tranquility",
    sortOrder: 2,
    isHero: false,
  },
  {
    url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80",
    caption: "Modern gourmet kitchen with Siemens induction cooktop and Nespresso coffee station",
    sortOrder: 3,
    isHero: false,
  },
  {
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80",
    caption: "Designer bathroom with walk-in Italian rainfall shower and organic amenities",
    sortOrder: 4,
    isHero: false,
  },
  {
    url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80",
    caption: "Second bedroom with queen-size bed and dedicated ergonomic work station",
    sortOrder: 5,
    isHero: false,
  },
  {
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80",
    caption: "Private morning coffee nook overlooking historic Grimmaische Straße",
    sortOrder: 6,
    isHero: false,
  },
];

export const SEED_AMENITIES = [
  { name: "Gigabit High-Speed Fiber Wi-Fi (1,000 Mbps)", category: "Essentials", iconName: "Wifi" },
  { name: "65-inch 4K OLED Smart TV (Netflix / AppleTV)", category: "Entertainment", iconName: "Tv" },
  { name: "Fully Equipped Gourmet Kitchen", category: "Kitchen", iconName: "UtensilsCrossed" },
  { name: "Nespresso Machine with Complimentary Pods", category: "Kitchen", iconName: "Coffee" },
  { name: "Siemens Dishwasher & Refrigerator", category: "Kitchen", iconName: "Refrigerator" },
  { name: "Washer & Heat-Pump Dryer in Unit", category: "Essentials", iconName: "Shirt" },
  { name: "Quiet Air Conditioning & Climate Heating", category: "Comfort", iconName: "Wind" },
  { name: "Walk-in Italian Rainfall Shower", category: "Bathroom", iconName: "ShowerHead" },
  { name: "High-Thread-Count Egyptian Cotton Linens", category: "Comfort", iconName: "BedDouble" },
  { name: "Dedicated Ergonomic Work Desk & Chair", category: "Work", iconName: "Laptop" },
  { name: "Keyless Self-Check-in Smart Lock", category: "Safety", iconName: "Key" },
  { name: "Elevator Access to 3rd Floor", category: "Accessibility", iconName: "Building2" },
  { name: "First Aid Kit & Smoke / CO Detectors", category: "Safety", iconName: "ShieldCheck" },
  { name: "Blackout Curtains in All Bedrooms", category: "Comfort", iconName: "Moon" },
];

export const SEED_HOUSE_RULES = [
  {
    title: "Check-in & Check-out",
    description: "Check-in begins at 15:00 CET via 24/7 keyless PIN code. Check-out is strictly by 11:00 CET to allow our professional cleaning team time to prepare.",
    ruleType: "CHECKIN",
    sortOrder: 1,
  },
  {
    title: "Quiet Hours (Nachtruhe)",
    description: "In accordance with German municipal housing regulations, quiet hours are observed between 22:00 and 07:00. Please be respectful of our neighbors in the residential building.",
    ruleType: "QUIET_HOURS",
    sortOrder: 2,
  },
  {
    title: "Strictly Non-Smoking",
    description: "Smoking or vaping is strictly prohibited inside the apartment. Any violation triggers a mandatory €350 deep-cleaning and ozone treatment fee.",
    ruleType: "NO_SMOKING",
    sortOrder: 3,
  },
  {
    title: "No Parties or Unauthorized Events",
    description: "Parties, commercial video shoots, or gatherings beyond the booked number of registered guests are strictly forbidden.",
    ruleType: "PARTIES",
    sortOrder: 4,
  },
  {
    title: "Pets on Prior Request",
    description: "Well-behaved small dogs may be approved on request with a pet fee of €35 per stay.",
    ruleType: "PETS",
    sortOrder: 5,
  },
];

export const SEED_FAQS = [
  {
    question: "How do I check in?",
    answer: "You will receive a personalized digital door lock PIN code 24 hours prior to arrival via email and in your guest portal. Check-in is 100% contactless and flexible starting from 15:00.",
  },
  {
    question: "Is luggage storage available?",
    answer: "Yes! If you arrive early or want to explore Leipzig after 11:00 check-out, you can store your luggage free of charge in our secured building lockers or at the nearby Leipzig Central Station luggage center (5 min walk).",
  },
  {
    question: "Where can I park?",
    answer: "Underground parking is available at Q-Park Augustusplatz (200m away, approx. €18/day) or Parkhaus Karstadt (150m away). We also offer one reserved garage space upon request for €15/night.",
  },
  {
    question: "How does the Leipzig Guest Tax (Gästetaxe) work?",
    answer: "The City of Leipzig imposes a statutory 5% accommodation tax on all overnight stays (Beherbergungssteuer). This is calculated automatically and itemized transparently in your final total.",
  },
  {
    question: "What is your cancellation policy?",
    answer: "Full 100% refund for cancellations up to 14 days before check-in. 50% refund up to 7 days before check-in. Inside 7 days, bookings are non-refundable.",
  },
];

export const SEED_LEIPZIG_GUIDE = [
  {
    title: "Gewandhaus zu Leipzig",
    distance: "2 min walk",
    category: "Culture & Music",
    description: "Home of the world-renowned Gewandhausorchester. A premier concert hall with unforgettable acoustics.",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "St. Thomas Church (Thomaskirche)",
    distance: "8 min walk",
    category: "History & Music",
    description: "The historical workplace and resting place of Johann Sebastian Bach, with weekly performances by the Thomanerchor.",
    image: "https://images.unsplash.com/photo-1548625361-195fe5780fb9?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Mädler-Passage & Auerbachs Keller",
    distance: "5 min walk",
    category: "Dining & Architecture",
    description: "Historic 16th-century vaulted tavern famous from Goethe's Faust, beneath Leipzig's most elegant covered shopping passage.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Clara-Zetkin-Park & Karl-Heine-Kanal",
    distance: "15 min walk / 5 min bike",
    category: "Nature & Leisure",
    description: "Vast riverside parks, beer gardens, and scenic canals perfect for renting a canoe through Leipzig's green waterways.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
  },
];
