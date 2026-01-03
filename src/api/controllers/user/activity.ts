import sql from "../../db/connect";

export async function getActivities(req: Request) {
  try {
    const url = new URL(req.url);
    const countryId = url.searchParams.get("country_id");

    if (!countryId) {
      return new Response(
        JSON.stringify({ message: "country_id is required" }),
        { status: 400 },
      );
    }

    const activities = await sql`
      SELECT
        a.activity_id,
        a.name,
        a.cost,
        a.rating
      FROM activity a
      JOIN city c ON c.city_id = a.city_id
      WHERE c.country_id = ${countryId}
      ORDER BY a.name ASC
    `;

    return Response.json(activities);
  } catch (err) {
    console.error("getActivities error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to fetch activities" }),
      { status: 500 },
    );
  }
}
