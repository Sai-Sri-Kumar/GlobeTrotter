import { useEffect, useState } from "react";
import { useAuth } from "../context/auth.context";

/* ---------------- UTILS ---------------- */
function getActivityImage(activityId: number) {
  return `https://picsum.photos/seed/activity-${activityId}/600/400`;
}

/* ---------------- TYPES ---------------- */

type Country = {
  country_id: number;
  country_name: string;
};

type Activity = {
  activity_id: number;
  name: string;
  activity_type: string;
  duration: number;
  cost: number;
  rating?: number;
  description: string;
};

type DayPlan = {
  day: number;
  activities: Activity[];
};

type Props = {
  open: boolean;
  onClose: () => void;
};

/* ---------------- STAR UI ---------------- */

function Star({
  type,
  className,
}: {
  type: "full" | "half" | "empty";
  className: string;
}) {
  if (type === "half") {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          fill="url(#half)"
          d="M12 2l3.1 6.3 7 .9-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-.9z"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${
        type === "full" ? "text-yellow-400" : "text-slate-300"
      }`}
      fill="currentColor"
    >
      <path d="M12 2l3.1 6.3 7 .9-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-.9z" />
    </svg>
  );
}

function RatingStars({ value }: { value?: number }) {
  const rating = Number(value ?? 0);
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} type="full" className="w-4 h-4" />
      ))}
      {hasHalf && <Star type="half" className="w-4 h-4" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} type="empty" className="w-4 h-4" />
      ))}
      <span className="ml-1 text-xs font-medium text-slate-600">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */

export default function PlanTripModal({ open, onClose }: Props) {
  const [tripName, setTripName] = useState("");

  const { user } = useAuth();

  console.log(user);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [countries, setCountries] = useState<Country[]>([]);
  const [countryId, setCountryId] = useState<number | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [activeDay, setActiveDay] = useState(1);

  const [dragItem, setDragItem] = useState<Activity | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- HELPERS ---------------- */

  function totalDays() {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    return Math.max(
      Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      0,
    );
  }

  function resetPlans(dayCount: number) {
    setPlans(
      Array.from({ length: dayCount }, (_, i) => ({
        day: i + 1,
        activities: [],
      })),
    );
    setActiveDay(1);
  }

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (!open) return;
    fetch("/api/countries")
      .then((r) => r.json())
      .then(setCountries);
  }, [open]);

  useEffect(() => {
    if (!countryId) {
      setActivities([]);
      resetPlans(totalDays());
      return;
    }

    resetPlans(totalDays());
    fetch(`/api/activities?country_id=${countryId}`)
      .then((r) => r.json())
      .then(setActivities);
  }, [countryId]);

  useEffect(() => {
    resetPlans(totalDays());
  }, [startDate, endDate]);

  /* ---------------- ACTIVITY ACTIONS ---------------- */

  function addActivity(a: Activity) {
    setPlans((prev) =>
      prev.map((d) =>
        d.day === activeDay ? { ...d, activities: [...d.activities, a] } : d,
      ),
    );
  }

  function removeActivity(day: number, id: number) {
    setPlans((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              activities: d.activities.filter((a) => a.activity_id !== id),
            }
          : d,
      ),
    );
  }

  function onDrop(day: number) {
    if (!dragItem) return;

    setPlans((prev) =>
      prev.map((d) =>
        d.day === day
          ? { ...d, activities: [...d.activities, dragItem] }
          : {
              ...d,
              activities: d.activities.filter(
                (a) => a.activity_id !== dragItem.activity_id,
              ),
            },
      ),
    );
    setDragItem(null);
  }

  /* ---------------- CREATE TRIP (REAL API) ---------------- */

  async function createTrip() {
    if (!tripName || !countryId || !startDate || !endDate) return;

    setSubmitting(true);

    console.log(user.user_id);

    const payload = {
      user_id: user.user_id,
      trip_name: tripName,
      country_id: countryId,
      start_date: startDate,
      end_date: endDate,
      days: plans.map((d) => ({
        day: d.day,
        activities: d.activities.map((a) => a.activity_id),
      })),
    };

    try {
      const res = await fetch("/api/trips/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create trip");
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert("Unable to create trip");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  /* ---------------- RENDER ---------------- */

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[80vh] flex overflow-hidden">
        {/* LEFT */}
        <div className="w-1/3 border-r p-6 space-y-4">
          <h2 className="text-xl font-semibold">Plan Your Trip</h2>

          <input
            className="border rounded-lg px-4 py-2 w-full"
            placeholder="Trip name"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
          />

          <select
            className="border rounded-lg px-4 py-2 w-full"
            value={countryId ?? ""}
            onChange={(e) => setCountryId(Number(e.target.value))}
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.country_id} value={c.country_id}>
                {c.country_name}
              </option>
            ))}
          </select>

          {/* ✅ INDEPENDENT DATES */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              className="border rounded-lg px-4 py-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="border rounded-lg px-4 py-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {plans.map((d) => (
              <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeDay === d.day ? "bg-indigo-600 text-white" : "border"
                }`}
              >
                Day {d.day}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <div className="w-1/3 p-6 bg-slate-50 overflow-y-auto">
          <h3 className="font-semibold mb-4">Day {activeDay}</h3>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(activeDay)}
            className="space-y-3 min-h-[200px]"
          >
            {plans
              .find((d) => d.day === activeDay)
              ?.activities.map((a) => (
                <div
                  key={a.activity_id}
                  draggable
                  onDragStart={() => setDragItem(a)}
                  className="bg-white border rounded-xl p-3 flex gap-3"
                >
                  <img
                    src={getActivityImage(a.activity_id)}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium text-sm">{a.name}</p>
                      <button
                        onClick={() => removeActivity(activeDay, a.activity_id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500 mt-2">
                      <span>⏱ {a.duration}h</span>
                      <span>₹ {a.cost}</span>
                      <RatingStars value={a.rating} />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-1/3 p-6 overflow-y-auto">
          <h3 className="font-semibold mb-4">Activities</h3>

          <div className="space-y-3">
            {activities.map((a) => (
              <div
                key={a.activity_id}
                onClick={() => addActivity(a)}
                className="border rounded-xl overflow-hidden hover:bg-slate-50 cursor-pointer"
              >
                <img
                  src={getActivityImage(a.activity_id)}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4 space-y-2">
                  <h4 className="font-semibold">{a.name}</h4>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>⏱ {a.duration}h</span>
                    <RatingStars value={a.rating} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 w-full border-t bg-white px-6 py-4 flex justify-between">
          <button onClick={onClose} className="text-slate-600">
            Cancel
          </button>
          <button
            onClick={createTrip}
            disabled={
              submitting || !tripName || !countryId || !startDate || !endDate
            }
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg disabled:opacity-40"
          >
            {submitting ? "Creating..." : "Create Trip"}
          </button>
        </div>
      </div>
    </div>
  );
}
