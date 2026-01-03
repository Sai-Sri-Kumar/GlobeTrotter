import sql from "../../db/connect";

import { getUserFromRequest } from "../../middleware/auth.middleware";

export async function deleteTrip(req: Request) {
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
    // Verify trip exists and belongs to user
    const tripResult = await sql`
      SELECT trip_id
      FROM trip
      WHERE trip_id = ${tripId} AND user_id = ${user.id}
    `;

    if (tripResult.length === 0) {
      return new Response(JSON.stringify({ message: "Trip not found" }), {
        status: 404,
      });
    }

    // Delete trip and activities in transaction
    await sql.begin(async (tx) => {
      // Delete trip activities first (foreign key constraint)
      await tx`
        DELETE FROM trip_activity
        WHERE trip_id = ${tripId}
      `;

      // Delete trip
      await tx`
        DELETE FROM trip
        WHERE trip_id = ${tripId}
      `;
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 },
    );
  }
}
