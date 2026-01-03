import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useAuth } from "../context/auth.context";

/* ---------------- TYPES ---------------- */

type Activity = {
  activity_id: number;
  activity_name: string;
  scheduled_date: string;
  cost: number | null;
  rating: number | null;
};

type TripDetail = {
  trip_id: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  total_budget: number | null;
  activities: Activity[];
};

type TripStatus = "upcoming" | "ongoing" | "completed";

/* ---------------- COMPONENT ---------------- */

export default function TripDetail() {
  const { user } = useAuth();
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ---------- LOAD TRIP ---------- */
  useEffect(() => {
    loadTrip();
  }, [tripId]);

  async function loadTrip() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/trips/${tripId}`, {
        credentials: "include",
      });

      if (res.status === 404) {
        setError("Trip not found");
        setLoading(false);
        return;
      }

      if (res.status === 403) {
        setError("You don't have access to this trip");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load trip");
      }

      const data = await res.json();
      setTrip(data);
    } catch (err) {
      setError("Failed to load trip. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- DELETE TRIP ---------- */
  async function handleDelete() {
    if (!trip) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/trips/${trip.trip_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete trip");
      }

      navigate("/trips");
    } catch (err) {
      alert("Failed to delete trip. Please try again.");
      setDeleting(false);
    }
  }

  /* ---------- STATUS CALCULATION ---------- */
  function getTripStatus(trip: TripDetail): TripStatus {
    const now = new Date();
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);

    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "ongoing";
  }

  /* ---------- ITINERARY HELPERS ---------- */
  function getDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end date
  }

  function groupActivitiesByDate(
    activities: Activity[],
  ): Map<string, Activity[]> {
    const grouped = new Map<string, Activity[]>();

    activities.forEach((activity) => {
      const date = activity.scheduled_date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(activity);
    });

    return grouped;
  }

  function getDayNumber(startDate: string, currentDate: string): number {
    const start = new Date(startDate);
    const current = new Date(currentDate);
    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }

  function getAllDates(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /* ---------- FORMAT HELPERS ---------- */
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  function formatBudget(budget: number | null): string {
    if (budget === null) return "Budget not set";
    return `₹ ${budget.toLocaleString()}`;
  }

  function formatCost(cost: number | null): string {
    if (cost === null || cost === 0) return "Free";
    return `₹ ${cost.toLocaleString()}`;
  }

  function formatRating(rating: number | null): string {
    if (rating === null) return "Not rated";
    return `⭐ ${rating}`;
  }

  function getStatusBadge(status: TripStatus): JSX.Element {
    const styles = {
      upcoming: "bg-blue-100 text-blue-700",
      ongoing: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${styles[status]}`}
      >
        {status}
      </span>
    );
  }

  /* ---------- RENDER ---------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading trip…
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-semibold text-indigo-600">
              GlobalTrotter
            </Link>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-8 py-24 text-center">
          <h2 className="text-2xl font-semibold text-slate-700 mb-4">
            {error || "Trip not found"}
          </h2>
          <Link
            to="/trips"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            Back to My Trips
          </Link>
        </div>
      </div>
    );
  }

  const status = getTripStatus(trip);
  const totalDays = getDaysBetween(trip.start_date, trip.end_date);
  const groupedActivities = groupActivitiesByDate(trip.activities);
  const allDates = getAllDates(trip.start_date, trip.end_date);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold text-indigo-600">
            GlobalTrotter
          </Link>

          {user && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">
                {user.first_name?.[0]}
              </div>
              <span className="text-sm font-medium">{user.first_name}</span>
            </div>
          )}
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-slate-600">
          <Link to="/trips" className="hover:text-indigo-600">
            My Trips
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{trip.trip_name}</span>
        </div>

        {/* Trip Header */}
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-semibold">{trip.trip_name}</h1>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="px-5 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Trip"}
          </button>
        </div>

        {/* Trip Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm text-slate-500 mb-1">Start Date</h3>
            <p className="text-lg font-semibold">
              {formatDate(trip.start_date)}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm text-slate-500 mb-1">End Date</h3>
            <p className="text-lg font-semibold">{formatDate(trip.end_date)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm text-slate-500 mb-1">Total Budget</h3>
            <p className="text-lg font-semibold">
              {formatBudget(trip.total_budget)}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm text-slate-500 mb-1">Status</h3>
            <div className="mt-1">{getStatusBadge(status)}</div>
          </div>
        </div>

        {/* Itinerary Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Itinerary ({totalDays} days)
          </h2>

          {trip.activities.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">
              No activities planned for this trip
            </p>
          ) : (
            <div className="space-y-6">
              {allDates.map((date) => {
                const dayActivities = groupedActivities.get(date) || [];
                const dayNumber = getDayNumber(trip.start_date, date);

                return (
                  <div key={date} className="border-l-4 border-indigo-200 pl-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Day {dayNumber} - {formatDate(date)}
                    </h3>

                    {dayActivities.length === 0 ? (
                      <p className="text-slate-500 text-sm">
                        No activities planned
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {dayActivities.map((activity) => (
                          <div
                            key={activity.activity_id}
                            className="bg-slate-50 rounded-lg p-4"
                          >
                            <h4 className="font-semibold mb-2">
                              {activity.activity_name}
                            </h4>
                            <div className="flex gap-4 text-sm text-slate-600">
                              <span>{formatCost(activity.cost)}</span>
                              <span>{formatRating(activity.rating)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Delete Trip</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{trip.trip_name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-5 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
