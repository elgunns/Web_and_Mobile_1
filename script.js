const seatMap = document.getElementById("seat-map");

function createRowLabel(row) {
  const label = document.createElement("span");
  label.className = "row-label";
  label.textContent = row;
  return label;
}

function createSeatButton(section, row, number) {
  const seatId = makeSeatId(row, number);
  const button = document.createElement("button");

  button.type = "button";
  button.className = `seat ${section.category}`;
  button.dataset.seatId = seatId;
  button.textContent = number;
  button.setAttribute("aria-label", `${section.name}, row ${row}, seat ${number}`);

  if (UNAVAILABLE_SEATS.includes(seatId)) {
    button.classList.add("unavailable");
    button.setAttribute("aria-disabled", "true");
  }

  return button;
}

function renderSection(section) {
  const category = PRICE_CATEGORIES[section.category];
  const sectionEl = document.createElement("div");
  sectionEl.className = "section";

  const title = document.createElement("h3");
  title.className = "section-title";
  title.textContent = `${section.name} — ${category.price} ${VENUE.currency}`;
  sectionEl.appendChild(title);

  section.rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "seat-row";
    rowEl.appendChild(createRowLabel(row));

    for (let number = 1; number <= section.seatsPerRow; number++) {
      rowEl.appendChild(createSeatButton(section, row, number));

      if (number === section.aisleAfter) {
        const aisle = document.createElement("span");
        aisle.className = "aisle";
        rowEl.appendChild(aisle);
      }
    }

    rowEl.appendChild(createRowLabel(row));
    sectionEl.appendChild(rowEl);
  });

  return sectionEl;
}

function renderVenue() {
  seatMap.innerHTML = "";
  VENUE.sections.forEach((section) => {
    seatMap.appendChild(renderSection(section));
  });
}

renderVenue();
const seatInfo = document.getElementById("seat-info");
const addToCartButton = document.getElementById("add-to-cart");
let inspectedSeatId = null;

function getSeatButton(seatId) {
  return seatMap.querySelector(`[data-seat-id="${seatId}"]`);
}

function findSeat(seatId) {
  const [row, number] = seatId.split("-");
  const section = VENUE.sections.find((s) => s.rows.includes(row));
  const category = PRICE_CATEGORIES[section.category];

  return {
    id: seatId,
    row,
    number: Number(number),
    section: section.name,
    category: category.label,
    price: category.price,
    unavailable: UNAVAILABLE_SEATS.includes(seatId),
  };
}

function showSeatDetails(seat) {
  seatInfo.innerHTML = `
    <dl class="seat-details-list">
      <dt>Section</dt><dd>${seat.section}</dd>
      <dt>Row</dt><dd>${seat.row}</dd>
      <dt>Seat</dt><dd>${seat.number}</dd>
      <dt>Category</dt><dd>${seat.category}</dd>
      <dt>Price</dt><dd>${seat.price} ${VENUE.currency}</dd>
      <dt>Status</dt><dd>${seat.unavailable ? "Unavailable" : "Available"}</dd>
    </dl>
  `;
  addToCartButton.disabled = seat.unavailable;
}

function inspectSeat(seatId) {
  if (inspectedSeatId) {
    getSeatButton(inspectedSeatId).classList.remove("inspected");
  }

  const seat = findSeat(seatId);
  inspectedSeatId = seat.unavailable ? null : seatId;

  if (inspectedSeatId) {
    getSeatButton(seatId).classList.add("inspected");
  }

  showSeatDetails(seat);
}

seatMap.addEventListener("click", (event) => {
  const button = event.target.closest(".seat");
  if (!button) return;
  inspectSeat(button.dataset.seatId);
});