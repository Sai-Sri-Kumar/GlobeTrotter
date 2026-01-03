import sql from "../../db/connect";

import { getUserFromRequest } from "../../middleware/auth.middleware";

export async function getTripDetail(req: Request) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const url = new URL(req.url);
  const tripId = url.pathname.split("/").pop();

  if (!tripId || isNaN(Number(tripId))) {
    return new Response(JSON.stringify({ message: "Invalid trip ID" }), {
      status: 400,
    });
  }

  try {
    // Fetch trip details
    const tripResult = await sql`
      SELECT
        trip_id,
        trip_name,
        start_date,
        end_date,
        total_budget
      FROM trip
      WHERE trip_id = ${tripId} AND user_id = ${user.id}
    `;

    if (tripResult.length === 0) {
      return new Response(JSON.stringify({ message: "Trip not found" }), {
        status: 404,
      });
    }

    const trip = tripResult[0];

    // Fetch activities for this trip
    const activities = await sql`
      SELECT
        a.activity_id,
        a.name as activity_name,
        ta.scheduled_date,
        a.cost,
        a.rating
      FROM trip_activity ta
      JOIN activity a ON ta.activity_id = a.activity_id
      WHERE ta.trip_id = ${tripId}
      ORDER BY ta.scheduled_date ASC
    `;

    return Response.json({
      ...trip,
      activities: activities,
    });
  } catch (error) {
    console.error("Error fetching trip details:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 },
    );
  }
}
