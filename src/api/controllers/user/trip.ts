import sql from "../../db/connect";

import { getUserFromRequest } from "../../middleware/auth.middleware";

export async function getMyTrips(req: Request) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const trips = await sql`
    SELECT
      trip_id,
      trip_name,
      start_date,
      end_date,
      total_budget
    FROM trip
    WHERE user_id = ${user.id}
    ORDER BY start_date DESC
  `;

  return Response.json(trips);
}
