// script.js

// Konfiguration: kapacitet og form pr. bord

const TABLE_CONFIG = {
  // restaurant 1–17
  1: { capacity: 5, room: "restaurant", shape: "rect" },
  2: { capacity: 5, room: "restaurant", shape: "rect" },
  3: { capacity: 4, room: "restaurant", shape: "rect" },
  4: { capacity: 4, room: "restaurant", shape: "rect" },
  5: { capacity: 5, room: "restaurant", shape: "round" },
  6: { capacity: 5, room: "restaurant", shape: "round" },
  7: { capacity: 5, room: "restaurant", shape: "round" },
  8: { capacity: 5, room: "restaurant", shape: "round" },
  9: { capacity: 6, room: "restaurant", shape: "rect" },
  10: { capacity: 7, room: "restaurant", shape: "rect" },
  11: { capacity: 7, room: "restaurant", shape: "rect" },
  12: { capacity: 7, room: "restaurant", shape: "rect" },
  13: { capacity: 5, room: "restaurant", shape: "round" },
  14: { capacity: 5, room: "restaurant", shape: "round" },
  15: { capacity: 5, room: "restaurant", shape: "round" },
  16: { capacity: 5, room: "restaurant", shape: "round" },
  17: { capacity: 5, room: "restaurant", shape: "round" },
  // pejsestue 18–26
  18: { capacity: 4, room: "pejsestue", shape: "rect" },
  19: { capacity: 8, room: "pejsestue", shape: "rect" },
  20: { capacity: 6, room: "pejsestue", shape: "rect" },
  21: { capacity: 6, room: "pejsestue", shape: "rect" },
  22: { capacity: 4, room: "pejsestue", shape: "rect" },
  23: { capacity: 4, room: "pejsestue", shape: "rect" },
  24: { capacity: 4, room: "pejsestue", shape: "rect" },
  25: { capacity: 4, room: "pejsestue", shape: "rect" },
  26: { capacity: 4, room: "pejsestue", shape: "rect" }
};

let bookingsData = { dates: {} };
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = new Date();
let currentRoom = "pejsestue"; // eller "restaurant"
let currentView = "plan"; // eller "list"

const monthLabel = document.getElementById("month-label");
const selectedDateLabel = document.getElementById("selected-date-label");
const calendarContainer = document.getElementById("calendar");
const noDataEl = document.getElementById("no-data");

// knapper
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const btnPejsestue = document.getElementById("btn-pejsestue");
const btnRestaurant = document.getElementById("btn-restaurant");
const btnViewPlan = document.getElementById("btn-view-plan");
const btnViewList = document.getElementById("btn-view-list");
const btnPrintPlan = document.getElementById("btn-print-plan");
const btnPrintList = document.getElementById("btn-print-list");

// rum-plan containere
const pejsPlan = document.getElementById("pejsestue-plan");
const restPlan = document.getElementById("restaurant-plan");
const pejsList = document.getElementById("pejsestue-list");
const restList = document.getElementById("restaurant-list");

const viewPlanPane = document.getElementById("view-plan");
const viewListPane = document.getElementById("view-list");

// Hjælpefunktioner

function formatDateISO(date) {
  return date.toISOString().slice(0, 10);
}

function formatDateHuman(date) {
  return date.toLocaleDateString("da-DK", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function getMonthName(month, year) {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString("da-DK", { month: "long", year: "numeric" });
}

// Hent data fra backend

async function loadBookings() {
  try {
    const res = await fetch("/.netlify/functions/bookings");
    const data = await res.json();
    bookingsData = data || { dates: {} };
    renderCalendar();
    renderAll();
  } catch (e) {
    console.error("Fejl ved hentning af data", e);
  }
}

// Kalender

function renderCalendar() {
  calendarContainer.innerHTML = "";

  const header = document.createElement("div");
  header.className = "calendar-header";
  const weekdays = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];
  weekdays.forEach((d) => {
    const el = document.createElement("div");
    el.textContent = d;
    header.appendChild(el);
  });

  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // mandag=0
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonthDays = startDay;
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

  const todayISO = formatDateISO(new Date());
  const selectedISO = formatDateISO(selectedDate);

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const dayNumber = i - prevMonthDays + 1;
    const cellDate = new Date(currentYear, currentMonth, dayNumber);
    const cellISO = formatDateISO(cellDate);

    cell.textContent = cellDate.getDate();

    if (cellDate.getMonth() !== currentMonth) {
      cell.classList.add("other-month");
    }

    if (cellISO === todayISO) {
      cell.classList.add("today");
    }

    if (cellISO === selectedISO) {
      cell.classList.add("selected");
    }

    // markér dage med bookinger
    if (bookingsData.dates && bookingsData.dates[cellISO]) {
      const dayData = bookingsData.dates[cellISO];
      if (
        (dayData.pejsestue && Object.keys(dayData.pejsestue).length > 0) ||
        (dayData.restaurant && Object.keys(dayData.restaurant).length > 0)
      ) {
        cell.classList.add("has-bookings");
      }
    }

    cell.addEventListener("click", () => {
      selectedDate = cellDate;
      renderCalendar();
      renderAll();
    });

    grid.appendChild(cell);
  }

  calendarContainer.appendChild(header);
  calendarContainer.appendChild(grid);

  monthLabel.textContent = getMonthName(currentMonth, currentYear);
  selectedDateLabel.textContent = formatDateHuman(selectedDate);
}

// Bordstørrelse ud fra kapacitet (base 60px)

function getTableSize(capacity) {
  const base = 60;
  const factor = capacity / 4; // 4 pers = 1x, 8 pers = 2x
  const size = Math.round(base * factor);
  return Math.max(40, size); // minimum størrelse
}

// Render rum-planer og lister

function renderAll() {
  const iso = formatDateISO(selectedDate);
  const dayData = bookingsData.dates[iso] || {
    pejsestue: {},
    restaurant: {}
  };

  const hasPejs =
    dayData.pejsestue && Object.keys(dayData.pejsestue).length > 0;
  const hasRest =
    dayData.restaurant && Object.keys(dayData.restaurant).length > 0;

  // vis "ingen data" hvis helt tomt
  if (!hasPejs && !hasRest) {
    noDataEl.classList.remove("hidden");
  } else {
    noDataEl.classList.add("hidden");
  }

  renderPejsestuePlan(dayData.pejsestue);
  renderRestaurantPlan(dayData.restaurant);
  renderPejsestueList(dayData.pejsestue);
  renderRestaurantList(dayData.restaurant);

  updateRoomVisibility();
  updateViewVisibility();
}

function renderPejsestuePlan(roomData) {
  pejsPlan.innerHTML = "";

  const title = document.createElement("div");
  title.className = "room-title";
  title.textContent = "Pejsestuen";
  pejsPlan.appendChild(title);

  const sub = document.createElement("div");
  sub.className = "room-subtitle";
  sub.textContent = "Ved vandet – med pejs";
  pejsPlan.appendChild(sub);

  const grid = document.createElement("div");
  grid.className = "pejsestue-grid";

  // ekstra elementer
  const extraText = document.createElement("div");
  extraText.className = "pejsestue-extra";
  extraText.textContent = "Vandet";
  grid.appendChild(extraText);

  const pejs = document.createElement("div");
  pejs.className = "pejsestue-pejs";
  pejs.textContent = "Pejs";
  grid.appendChild(pejs);

  [22, 21, 20, 19, 18, 23, 24, 25, 26].forEach((nr) => {
    const cfg = TABLE_CONFIG[nr];
    const data = roomData[nr] || { capacity: cfg.capacity, guests: [] };
    grid.appendChild(createTableElement(nr, data, "pejsestue"));
  });

  pejsPlan.appendChild(grid);
}

function renderRestaurantPlan(roomData) {
  restPlan.innerHTML = "";

  const title = document.createElement("div");
  title.className = "room-title";
  title.textContent = "Restauranten";
  restPlan.appendChild(title);

  const sub = document.createElement("div");
  sub.className = "room-subtitle";
  sub.textContent = "Mellem vandet og haven";
  restPlan.appendChild(sub);

  const grid = document.createElement("div");
  grid.className = "restaurant-grid";

  const sides = document.createElement("div");
  sides.className = "restaurant-sides";
  sides.innerHTML = `
    <div class="restaurant-side-label">Vandet</div>
    <div class="restaurant-side-label">Haven</div>
  `;
  grid.appendChild(sides);

  const salat = document.createElement("div");
  salat.className = "restaurant-salat";
  salat.textContent = "Salatbord";
  grid.appendChild(salat);

  const buffet = document.createElement("div");
  buffet.className = "restaurant-buffet";
  buffet.textContent = "Buffet";
  grid.appendChild(buffet);

  // rækkefølge giver et pænt billede
  const tablesOrder = [4, 5, 6, 7, 8, 9, 3, 10, 13, 14, 15, 2, 11, 16, 17, 1, 12];
  tablesOrder.forEach((nr) => {
    const cfg = TABLE_CONFIG[nr];
    const data = roomData[nr] || { capacity: cfg.capacity, guests: [] };
    grid.appendChild(createTableElement(nr, data, "restaurant"));
  });

  restPlan.appendChild(grid);
}

// generel table-render

function createTableElement(number, data, room) {
  const cfg = TABLE_CONFIG[number];
  const capacity = data.capacity || cfg.capacity;
  const guests = data.guests || [];

  const used = guests.length;
  const free = capacity - used;

  let statusClass = "free";
  if (used === 0) statusClass = "free";
  else if (used < capacity) statusClass = "partial";
  else statusClass = "full";

  const table = document.createElement("div");
  table.className = `table table-${number} ${statusClass}`;

  const shape = document.createElement("div");
  shape.className = `table-shape ${cfg.shape}`;

  const size = getTableSize(capacity);
  shape.style.width = size + "px";
  shape.style.height = cfg.shape === "round" ? size + "px" : size * 0.6 + "px";

  shape.textContent = number;

  const label = document.createElement("div");
  label.className = "table-label";
  label.textContent = `Bord ${number}`;

const guestsEl = document.createElement("div");
guestsEl.className = "table-guests";

const guestGroups = data.guests || {};
const entries = Object.entries(guestGroups);

if (entries.length === 0) {
  guestsEl.textContent = "Ingen bookinger";
} else {
  guestsEl.textContent = entries
    .map(([lejlighed, antal]) =>
      antal > 1 ? `Lejlighed ${lejlighed} (${antal})` : `Lejlighed ${lejlighed}`
    )
    .join(", ");
}

  const capEl = document.createElement("div");
  capEl.className = "table-capacity";
  capEl.textContent = `Pladser: ${used}/${capacity} (ledig: ${Math.max(
    0,
    free
  )})`;

  table.appendChild(shape);
  table.appendChild(label);
  table.appendChild(guestsEl);
  table.appendChild(capEl);

  return table;
}

// Listevisninger

function renderPejsestueList(roomData) {
  pejsList.innerHTML = "";

  const title = document.createElement("div");
  title.className = "room-title";
  title.textContent = "Pejsestuen – liste";
  pejsList.appendChild(title);

  const table = document.createElement("table");
  table.className = "list-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Bord</th>
        <th>Kapacitet</th>
        <th>Booket</th>
        <th>Pladser tilbage</th>
        <th>Gæster</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  [18, 19, 20, 21, 22, 23, 24, 25, 26].forEach((nr) => {
    const cfg = TABLE_CONFIG[nr];
    const data = roomData[nr] || { capacity: cfg.capacity, guests: [] };
    const capacity = data.capacity || cfg.capacity;
    const guests = data.guests || [];
    const used = guests.length;
    const free = capacity - used;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${nr}</td>
      <td>${capacity}</td>
      <td>${used}</td>
      <td>${Math.max(0, free)}</td>
<td class="guests">${
  (() => {
    const groups = data.guests || {};
    const items = Object.entries(groups).map(([l, a]) =>
      a > 1 ? `Lejlighed ${l} (${a})` : `Lejlighed ${l}`
    );
    return items.length ? items.join(", ") : "Ingen";
  })()
}</td>
    `;

    tbody.appendChild(tr);
  });

  pejsList.appendChild(table);
}

function renderRestaurantList(roomData) {
  restList.innerHTML = "";

  const title = document.createElement("div");
  title.className = "room-title";
  title.textContent = "Restauranten – liste";
  restList.appendChild(title);

  const table = document.createElement("table");
  table.className = "list-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Bord</th>
        <th>Kapacitet</th>
        <th>Booket</th>
        <th>Pladser tilbage</th>
        <th>Gæster</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  const order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  order.forEach((nr) => {
    const cfg = TABLE_CONFIG[nr];
    const data = roomData[nr] || { capacity: cfg.capacity, guests: [] };
    const capacity = data.capacity || cfg.capacity;
    const guests = data.guests || [];
    const used = guests.length;
    const free = capacity - used;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${nr}</td>
      <td>${capacity}</td>
      <td>${used}</td>
      <td>${Math.max(0, free)}</td>
<td class="guests">${
  (() => {
    const groups = data.guests || {};
    const items = Object.entries(groups).map(([l, a]) =>
      a > 1 ? `Lejlighed ${l} (${a})` : `Lejlighed ${l}`
    );
    return items.length ? items.join(", ") : "Ingen";
  })()
}</td>
    `;

    tbody.appendChild(tr);
  });

  restList.appendChild(table);
}

// Rum- / view-skift

function updateRoomVisibility() {
  const isPejs = currentRoom === "pejsestue";

  if (isPejs) {
    pejsPlan.classList.remove("hidden");
    pejsList.classList.remove("hidden");
    restPlan.classList.add("hidden");
    restList.classList.add("hidden");
    btnPejsestue.classList.add("active");
    btnRestaurant.classList.remove("active");
  } else {
    pejsPlan.classList.add("hidden");
    pejsList.classList.add("hidden");
    restPlan.classList.remove("hidden");
    restList.classList.remove("hidden");
    btnPejsestue.classList.remove("active");
    btnRestaurant.classList.add("active");
  }
}

function updateViewVisibility() {
  if (currentView === "plan") {
    viewPlanPane.classList.remove("hidden");
    viewListPane.classList.add("hidden");
    btnViewPlan.classList.add("active");
    btnViewList.classList.remove("active");
  } else {
    viewPlanPane.classList.add("hidden");
    viewListPane.classList.remove("hidden");
    btnViewPlan.classList.remove("active");
    btnViewList.classList.add("active");
  }
}

// Event handlers

prevMonthBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

btnPejsestue.addEventListener("click", () => {
  currentRoom = "pejsestue";
  updateRoomVisibility();
});

btnRestaurant.addEventListener("click", () => {
  currentRoom = "restaurant";
  updateRoomVisibility();
});

btnViewPlan.addEventListener("click", () => {
  currentView = "plan";
  updateViewVisibility();
});

btnViewList.addEventListener("click", () => {
  currentView = "list";
  updateViewVisibility();
});

btnPrintPlan.addEventListener("click", () => {
  document.body.classList.remove("print-list");
  document.body.classList.add("print-plan");
  window.print();
  document.body.classList.remove("print-plan");
});

btnPrintList.addEventListener("click", () => {
  document.body.classList.remove("print-plan");
  document.body.classList.add("print-list");
  window.print();
  document.body.classList.remove("print-list");
});

// init

document.addEventListener("DOMContentLoaded", () => {
  loadBookings();
});
