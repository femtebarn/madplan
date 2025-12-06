// netlify/functions/webhook.js

import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Hvor vi gemmer alle bookinger lokalt i Netlify
const DATA_FILE = __dirname + "/bookings.json";

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch {
    return {};
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export default async function handler(event, context) {
  try {
    // Acuity sender JSON i body'en
    const payload = JSON.parse(event.body);

    const {
      id,
      calendarID,
      appointmentType,
      lastName,
      datetime,
      status
    } = payload;

    if (!id || !appointmentType || !datetime) {
      return { statusCode: 200, body: "Ignored (missing fields)" };
    }

    // Opdel bordnavn "Bord 20 – plads til 6"
    const match = appointmentType.match(/Bord\s+(\d+)/i);
    if (!match) {
      return { statusCode: 200, body: "Ignored (not a table)" };
    }

    const table = match[1];
    const date = datetime.slice(0, 10);
    const lejlighed = lastName ? lastName.trim() : null;

    let data = readData();

    if (!data[date]) data[date] = {};
    if (!data[date][table]) data[date][table] = { guests: {} };

    // BOOKING ANNULLERET
    if (status === "canceled") {
      if (data[date][table].guests[lejlighed]) {
        delete data[date][table].guests[lejlighed];
      }
      writeData(data);
      return { statusCode: 200, body: "Booking deleted" };
    }

    // NY / ÆNDRET BOOKING
    if (!data[date][table].guests[lejlighed]) {
      data[date][table].guests[lejlighed] = 0;
    }

    data[date][table].guests[lejlighed]++;

    writeData(data);

    return {
      statusCode: 200,
      body: "Webhook processed"
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Webhook error: " + String(err)
    };
  }
}
