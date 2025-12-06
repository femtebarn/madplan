import { blobs } from "@netlify/blobs";

export default async (event, context) => {
  try {
    const store = blobs("bookings"); // en "bucket"
    const existing = await store.get("all", { type: "json" }) || [];

    const incoming = JSON.parse(event.body);

    existing.push({
      receivedAt: new Date().toISOString(),
      data: incoming
    });

    await store.setJSON("all", existing);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) })
    };
  }
};
