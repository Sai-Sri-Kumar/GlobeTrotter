import sql from "../../db/connect";

export async function homeOverview() {
  const countries = await sql`
    SELECT
      country_id,
      country_name,
      region,
      description
    FROM country
    ORDER BY country_id
    LIMIT 6
  `;

  const activities = await sql`
    SELECT
      activity_id,
      name,
      activity_type,
      cost,
      rating
    FROM activity
    ORDER BY rating DESC NULLS LAST
    LIMIT 8
  `;

  return Response.json({
    countries,
    activities,
  });
}
