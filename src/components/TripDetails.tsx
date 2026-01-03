import { useLocation, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";

type Activity = {
  activity_id: number;
  name: string;
  activity_type: string;
  duration: number;
  cost: number;
  rating: number;
  description: string;
};

type DayPlan = {
  date: string;
  activities: Activity[];
};

type TripDetails = {
  trip_id: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  days: DayPlan[];
};

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [trip, setTrip] = useState<TripDetails | null>(
    (location.state as { trip?: TripDetails })?.trip ?? null,
  );
  const [loading, setLoading] = useState(!trip);

  /* ---------- FALLBACK FETCH (on refresh / direct URL) ---------- */
  useEffect(() => {
    if (trip) return;

    async function fetchTrip() {
      try {
        const res = await fetch(`/api/trips/my?trip_id=${tripId}`);
        const data = await res.json();

        const found = data.find(
          (t: TripDetails) => t.trip_id === Number(tripId),
        );
        setTrip(found ?? null);
      } catch {
        setTrip(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTrip();
  }, [trip, tripId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading trip…
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Trip not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-12">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-indigo-600 hover:underline"
      >
        ← Back to trips
      </button>

      {/* ================= SUMMARY ================= */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border p-8 mb-10">
        <h1 className="text-3xl font-semibold">{trip.trip_name}</h1>

        <p className="text-slate-500 mt-2">
          {new Date(trip.start_date).toLocaleDateString()} →{" "}
          {new Date(trip.end_date).toLocaleDateString()}
        </p>

        <div className="mt-6 flex flex-wrap gap-6">
          <div className="text-emerald-600 font-semibold text-lg">
            Total Budget: ₹ {trip.total_budget}
          </div>

          <div className="text-slate-500">
            Duration:{" "}
            {Math.ceil(
              (new Date(trip.end_date).getTime() -
                new Date(trip.start_date).getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1}{" "}
            days
          </div>
        </div>
      </div>

      {/* ================= ITINERARY ================= */}
      <div className="max-w-5xl mx-auto space-y-8">
        <h2 className="text-2xl font-semibold">Itinerary</h2>

        {trip.days.length === 0 ? (
          <div className="text-slate-500">No activities added yet.</div>
        ) : (
          trip.days.map((day, index) => (
            <div key={day.date} className="bg-white border rounded-2xl p-6">
              {/* DAY HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Day {index + 1}</h3>
                <span className="text-sm text-slate-500">
                  {new Date(day.date).toLocaleDateString()}
                </span>
              </div>

              {/* ACTIVITIES */}
              <div className="space-y-4">
                {day.activities.map((a) => (
                  <div
                    key={a.activity_id}
                    className="flex justify-between gap-4 border rounded-xl p-4 hover:bg-slate-50 transition"
                  >
                    <div>
                      <h4 className="font-medium">{a.name}</h4>
                      <p className="text-sm text-slate-500">
                        {a.activity_type} • {a.duration}h
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {a.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-emerald-600 font-semibold">
                        ₹ {a.cost}
                      </div>
                      <div className="text-xs text-slate-500">
                        ⭐ {a.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
