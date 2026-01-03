import sql from "../../db/connect";

export async function getMyTrips(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id");

  if (!userId) {
    return new Response(JSON.stringify({ message: "user_id is required" }), {
      status: 400,
    });
  }

  /**
   * 1️⃣ Fetch trips
   */
  const trips = await sql`
    SELECT
      t.trip_id,
      t.trip_name,
      t.start_date,
      t.end_date,
      t.total_budget
    FROM trip t
    WHERE t.user_id = ${userId}
    ORDER BY t.start_date DESC
  `;

  if (trips.length === 0) {
    return Response.json([]);
  }

  const tripIds = trips.map((t) => t.trip_id);

  /**
   * 2️⃣ Fetch all activities for these trips (single query)
   */
  const activities = await sql`
    SELECT
      ta.trip_id,
      ta.scheduled_date,
      a.activity_id,
      a.name,
      a.activity_type,
      a.duration,
      a.cost,
      a.rating,
      a.description
    FROM trip_activity ta
    JOIN activity a
      ON a.activity_id = ta.activity_id
    WHERE ta.trip_id = ANY(${tripIds})
    ORDER BY ta.trip_id, ta.scheduled_date
  `;

  /**
   * 3️⃣ Group activities by trip → date
   */
  const tripMap = new Map<number, any>();

  for (const trip of trips) {
    tripMap.set(trip.trip_id, {
      ...trip,
      days: [],
    });
  }

  const dayMap = new Map<string, any>();

  for (const row of activities) {
    const key = `${row.trip_id}-${row.scheduled_date}`;

    if (!dayMap.has(key)) {
      const day = {
        date: row.scheduled_date,
        activities: [],
      };

      dayMap.set(key, day);
      tripMap.get(row.trip_id).days.push(day);
    }

    dayMap.get(key).activities.push({
      activity_id: row.activity_id,
      name: row.name,
      activity_type: row.activity_type,
      duration: row.duration,
      cost: row.cost,
      rating: row.rating,
      description: row.description,
    });
  }

  return Response.json(Array.from(tripMap.values()));
}
