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
const viewport = document.getElementById("map-viewport");
const mapContent = document.getElementById("map-content");

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const MOVE_STEP = 60;

const view = { scale: 1, x: 0, y: 0 };

// keep at least half of the viewport covered by the map
function clampView() {
  const contentWidth = mapContent.offsetWidth * view.scale;
  const contentHeight = mapContent.offsetHeight * view.scale;
  const halfW = viewport.clientWidth / 2;
  const halfH = viewport.clientHeight / 2;

  view.x = Math.min(halfW, Math.max(halfW - contentWidth, view.x));
  view.y = Math.min(halfH, Math.max(halfH - contentHeight, view.y));
}

function applyView() {
  clampView();
  mapContent.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
}

function zoom(delta) {
  const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.scale + delta));

  // zoom around the viewport center
  const centerX = viewport.clientWidth / 2;
  const centerY = viewport.clientHeight / 2;
  view.x = centerX - ((centerX - view.x) * newScale) / view.scale;
  view.y = centerY - ((centerY - view.y) * newScale) / view.scale;
  view.scale = newScale;

  applyView();
}

// moves the camera, so "up" shows the part of the map above
function move(dx, dy) {
  view.x -= dx;
  view.y -= dy;
  applyView();
}

function resetView() {
  view.scale = Math.min(1, viewport.clientWidth / mapContent.offsetWidth);
  view.x = (viewport.clientWidth - mapContent.offsetWidth * view.scale) / 2;
  view.y = 0;
  applyView();
}

document.getElementById("zoom-in").addEventListener("click", () => zoom(ZOOM_STEP));
document.getElementById("zoom-out").addEventListener("click", () => zoom(-ZOOM_STEP));
document.getElementById("move-up").addEventListener("click", () => move(0, -MOVE_STEP));
document.getElementById("move-down").addEventListener("click", () => move(0, MOVE_STEP));
document.getElementById("move-left").addEventListener("click", () => move(-MOVE_STEP, 0));
document.getElementById("move-right").addEventListener("click", () => move(MOVE_STEP, 0));
document.getElementById("reset-view").addEventListener("click", resetView);

resetView();