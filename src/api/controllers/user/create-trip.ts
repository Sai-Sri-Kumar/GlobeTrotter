import sql from "../../db/connect";

export async function createTrip(req: Request) {
  try {
    const body = await req.json();

    const { user_id, trip_name, start_date, end_date, total_budget, days } =
      body;

    if (
      !user_id ||
      !trip_name ||
      !start_date ||
      !end_date ||
      !Array.isArray(days)
    ) {
      return new Response("Invalid payload", { status: 400 });
    }

    const tripId = await sql.begin(async (tx) => {
      /* 1️⃣ Create trip */
      const [trip] = await tx`
        INSERT INTO trip (
          user_id,
          trip_name,
          start_date,
          end_date,
          total_budget
        )
        VALUES (
          ${user_id},
          ${trip_name},
          ${start_date},
          ${end_date},
          ${total_budget ?? null}
        )
        RETURNING trip_id
      `;

      /* 2️⃣ Insert trip activities */
      for (const d of days) {
        if (!Array.isArray(d.activities)) continue;

        for (const activity_id of d.activities) {
          await tx`
            INSERT INTO trip_activity (
              trip_id,
              activity_id,
              scheduled_date
            )
            VALUES (
              ${trip.trip_id},
              ${activity_id},
              ${d.date ?? null}
            )
          `;
        }
      }

      return trip.trip_id;
    });

    return Response.json({
      success: true,
      trip_id: tripId,
    });
  } catch (err) {
    console.error("CREATE TRIP ERROR:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
