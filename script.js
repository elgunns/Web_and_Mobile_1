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