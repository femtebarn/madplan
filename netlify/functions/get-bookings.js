import { blobs } from "@netlify/blobs";

export default async () => {
  try {
    const store = blobs("bookings");
    const all = await store.get("all", { type: "json" }) || [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(all)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) })
    };
  }
};
