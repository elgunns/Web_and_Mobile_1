const PRICE_CATEGORIES = {
  vip: { label: "VIP", price: 60 },
  standard: { label: "Standard", price: 35 },
  economy: { label: "Economy", price: 20 },
};
 
const VENUE = {
  name: "Grand Theatre",
  type: "theatre",
  currency: "AZN",
  sections: [
    {
      id: "vip",
      name: "VIP",
      category: "vip",
      rows: ["A", "B", "C"],
      seatsPerRow: 16,
      aisleAfter: null,
    },
    {
      id: "orchestra",
      name: "Orchestra",
      category: "standard",
      rows: ["D", "E", "F", "G", "H", "I", "J", "K"],
      seatsPerRow: 22,
      aisleAfter: 11, 
    },
    {
      id: "balcony",
      name: "Balcony",
      category: "economy",
      rows: ["L", "M", "N", "O", "P"],
      seatsPerRow: 26,
      aisleAfter: 13,
    },
  ],
};
 
const UNAVAILABLE_SEATS = [
  "A-7", "A-8", "B-3",
  "E-10", "E-11", "G-1", "G-2", "J-15",
  "M-20", "N-5", "N-6", "P-13",
];

function makeSeatId(row, number) {
  return `${row}-${number}`;
}
 
function getTotalSeatCount() {
  return VENUE.sections.reduce(
    (sum, section) => sum + section.rows.length * section.seatsPerRow,
    0
  );
}