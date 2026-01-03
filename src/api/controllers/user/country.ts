import sql from "../../db/connect";

export async function getCountries() {
  try {
    const countries = await sql`
      SELECT
        country_id,
        country_name,
        region
      FROM country
      ORDER BY country_name ASC
    `;

    return Response.json(countries);
  } catch (err) {
    console.error("getCountries error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to fetch countries" }),
      { status: 500 },
    );
  }
}
