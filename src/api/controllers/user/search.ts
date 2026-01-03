import sql from "../../db/connect";

export async function searchController(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") ?? "";

  if (query.length < 2) {
    return Response.json({ countries: [], activities: [] });
  }

  const q = `%${query.toLowerCase()}%`;

  const countries = await sql`
    SELECT country_id, country_name, region
    FROM country
    WHERE LOWER(country_name) LIKE ${q}
    LIMIT 5
  `;

  const activities = await sql`
    SELECT activity_id, name, activity_type, cost, rating
    FROM activity
    WHERE LOWER(name) LIKE ${q}
    LIMIT 5
  `;

  return Response.json({ countries, activities });
}
