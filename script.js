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

function renderPriceLegend() {
  const priceLegend = document.getElementById("price-legend");

  Object.keys(PRICE_CATEGORIES).forEach((key) => {
    const category = PRICE_CATEGORIES[key];
    const item = document.createElement("li");

    const swatch = document.createElement("span");
    swatch.className = `swatch ${key}`;

    item.append(swatch, `${category.label} — ${category.price} ${VENUE.currency}`);
    priceLegend.appendChild(item);
  });
}

renderPriceLegend();
const seatInfo = document.getElementById("seat-info");
const addToCartButton = document.getElementById("add-to-cart");
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const clearCartButton = document.getElementById("clear-cart");
let inspectedSeatId = null;
const cart = [];
const CART_STORAGE_KEY = "venue-cart";

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

function getSeatStatus(seat) {
  if (seat.unavailable) return "Unavailable";
  if (cart.includes(seat.id)) return "In cart";
  return "Available";
}

function showSeatDetails(seat) {
  seatInfo.innerHTML = `
    <dl class="seat-details-list">
      <dt>Section</dt><dd>${seat.section}</dd>
      <dt>Row</dt><dd>${seat.row}</dd>
      <dt>Seat</dt><dd>${seat.number}</dd>
      <dt>Category</dt><dd>${seat.category}</dd>
      <dt>Price</dt><dd>${seat.price} ${VENUE.currency}</dd>
      <dt>Status</dt><dd>${getSeatStatus(seat)}</dd>
    </dl>
  `;
  seatInfo.dataset.seatId = seat.id;
  addToCartButton.disabled = seat.unavailable || cart.includes(seat.id);

  if (seat.unavailable) {
    addToCartButton.textContent = "SEAT UNAVAILABLE";
  } else if (cart.includes(seat.id)) {
    addToCartButton.textContent = "ALREADY IN CART";
  } else {
    addToCartButton.textContent = "ADD TO CART";
  }
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

function addToCart() {
  if (!inspectedSeatId || cart.includes(inspectedSeatId)) return;

  const seatId = inspectedSeatId;
  cart.push(seatId);

  const button = getSeatButton(seatId);
  button.classList.remove("inspected");
  button.classList.add("in-cart");
  inspectedSeatId = null;

  showSeatDetails(findSeat(seatId));
  renderCart();
}

function removeFromCart(seatId) {
  const index = cart.indexOf(seatId);
  if (index === -1) return;

  cart.splice(index, 1);
  getSeatButton(seatId).classList.remove("in-cart");

  if (seatInfo.dataset.seatId === seatId) {
    showSeatDetails(findSeat(seatId));
  }
  renderCart();
}

function clearCart() {
  if (cart.length === 0) return;
  if (!confirm("Remove all tickets from the cart?")) return;

  cart.slice().forEach(removeFromCart);
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn("Could not save cart:", error);
  }
}

function loadCart() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
  } catch (error) {
    saved = null;
  }

  if (!Array.isArray(saved)) return;

  saved.forEach((seatId) => {
    const button = getSeatButton(seatId);
    if (!button || button.classList.contains("unavailable") || cart.includes(seatId)) return;

    cart.push(seatId);
    button.classList.add("in-cart");
  });
}

function renderCart() {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.textContent = "Your cart is empty.";
    cartList.appendChild(empty);
  }

  let total = 0;
  cart.forEach((seatId) => {
    const seat = findSeat(seatId);
    total += seat.price;

    const item = document.createElement("li");
    item.className = "cart-item";

    const label = document.createElement("span");
    label.textContent = `${seat.section} · Row ${seat.row}, Seat ${seat.number} — ${seat.price} ${VENUE.currency}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-ticket";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove ${seat.section}, row ${seat.row}, seat ${seat.number} from cart`);
    removeButton.addEventListener("click", () => removeFromCart(seatId));

    item.append(label, removeButton);
    cartList.appendChild(item);
  });

  cartTotal.textContent = `${total} ${VENUE.currency}`;
  cartCount.textContent = `(${cart.length})`;
  clearCartButton.disabled = cart.length === 0;
  saveCart();
}

addToCartButton.addEventListener("click", addToCart);
clearCartButton.addEventListener("click", clearCart);
const viewport = document.getElementById("map-viewport");
const mapContent = document.getElementById("map-content");

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const MOVE_STEP = 60;

const view = { scale: 1, x: 0, y: 0 };

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

  zoomInButton.disabled = view.scale >= MAX_ZOOM;
  zoomOutButton.disabled = view.scale <= MIN_ZOOM;
}

function zoom(delta) {
  const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.scale + delta));

  const centerX = viewport.clientWidth / 2;
  const centerY = viewport.clientHeight / 2;
  view.x = centerX - ((centerX - view.x) * newScale) / view.scale;
  view.y = centerY - ((centerY - view.y) * newScale) / view.scale;
  view.scale = newScale;

  applyView();
}

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

const zoomInButton = document.getElementById("zoom-in");
const zoomOutButton = document.getElementById("zoom-out");

zoomInButton.addEventListener("click", () => zoom(ZOOM_STEP));
zoomOutButton.addEventListener("click", () => zoom(-ZOOM_STEP));
document.getElementById("move-up").addEventListener("click", () => move(0, -MOVE_STEP));
document.getElementById("move-down").addEventListener("click", () => move(0, MOVE_STEP));
document.getElementById("move-left").addEventListener("click", () => move(-MOVE_STEP, 0));
document.getElementById("move-right").addEventListener("click", () => move(MOVE_STEP, 0));
document.getElementById("reset-view").addEventListener("click", resetView);

let lastViewportWidth = viewport.clientWidth;

window.addEventListener("resize", () => {
  if (viewport.clientWidth !== lastViewportWidth) {
    lastViewportWidth = viewport.clientWidth;
    resetView();
  } else {
    applyView();
  }
});

resetView();
loadCart();
renderCart();