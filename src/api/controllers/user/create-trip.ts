import sql from "../../db/connect";

function getDateFromDay(startDate: string, day: number) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + (day - 1));
  return date.toISOString().split("T")[0];
}

export async function createTrip(req: Request) {
  try {
    const body = await req.json();

    const { user_id, trip_name, start_date, end_date, days } = body;

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
      /* 1️⃣ Create trip (budget initially 0) */
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
          0
        )
        RETURNING trip_id
      `;

      let totalBudget = 0;

      /* 2️⃣ Insert activities + accumulate cost */
      for (const d of days) {
        if (!d.day || !Array.isArray(d.activities)) continue;

        const scheduledDate = getDateFromDay(start_date, d.day);

        for (const activity_id of d.activities) {
          // Fetch activity cost
          const [activity] = await tx`
            SELECT cost
            FROM activity
            WHERE activity_id = ${activity_id}
          `;

          if (!activity) {
            throw new Error(`Invalid activity_id: ${activity_id}`);
          }

          totalBudget += Number(activity.cost);

          await tx`
            INSERT INTO trip_activity (
              trip_id,
              activity_id,
              scheduled_date
            )
            VALUES (
              ${trip.trip_id},
              ${activity_id},
              ${scheduledDate}
            )
          `;
        }
      }

      /* 3️⃣ Update trip with final budget */
      await tx`
        UPDATE trip
        SET total_budget = ${totalBudget}
        WHERE trip_id = ${trip.trip_id}
      `;

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
