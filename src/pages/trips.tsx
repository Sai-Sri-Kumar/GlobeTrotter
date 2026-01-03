import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/auth.context";
import PlanTripModal from "../components/PlanTripModal";

/* ---------------- TYPES ---------------- */

type Trip = {
  trip_id: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  total_budget: number | null;
};

type TripStatus = "upcoming" | "ongoing" | "completed";
type FilterTab = "all" | "upcoming" | "ongoing" | "completed";

/* ---------------- COMPONENT ---------------- */

export default function Trips() {
  const { user } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [showPlanTrip, setShowPlanTrip] = useState(false);

  /* ---------- LOAD TRIPS ---------- */
  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/trips/my", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load trips");
      }

      const data = await res.json();
      setTrips(data);
    } catch (err) {
      setError("Failed to load trips. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- STATUS CALCULATION ---------- */
  function getTripStatus(trip: Trip): TripStatus {
    const now = new Date();
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);

    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "ongoing";
  }

  /* ---------- FILTERING ---------- */
  const filteredTrips = trips.filter((trip) => {
    if (activeTab === "all") return true;
    return getTripStatus(trip) === activeTab;
  });

  const counts = {
    all: trips.length,
    upcoming: trips.filter((t) => getTripStatus(t) === "upcoming").length,
    ongoing: trips.filter((t) => getTripStatus(t) === "ongoing").length,
    completed: trips.filter((t) => getTripStatus(t) === "completed").length,
  };

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
    if (budget === null) return "--";
    return `₹ ${budget.toLocaleString()}`;
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
        Loading trips…
      </div>
    );
  }

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
        {/* Page Title and Action */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">My Trips</h1>
          <button
            onClick={() => setShowPlanTrip(true)}
            className="px-6 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600"
          >
            + Plan New Trip
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {trips.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-2xl p-16 text-center">
            <p className="text-slate-500 mb-4">
              You haven't planned any trips yet
            </p>
            <button
              onClick={() => setShowPlanTrip(true)}
              className="px-6 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600"
            >
              Plan a Trip
            </button>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
              {(
                [
                  { key: "all", label: "All Trips" },
                  { key: "upcoming", label: "Upcoming" },
                  { key: "ongoing", label: "Ongoing" },
                  { key: "completed", label: "Completed" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 font-medium transition border-b-2 ${
                    activeTab === key
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label} ({counts[key]})
                </button>
              ))}
            </div>

            {/* Table */}
            {filteredTrips.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No {activeTab === "all" ? "" : activeTab} trips
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Trip Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTrips.map((trip) => {
                      const status = getTripStatus(trip);
                      return (
                        <tr key={trip.trip_id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <Link
                              to={`/trips/${trip.trip_id}`}
                              className="font-semibold text-indigo-600 hover:underline"
                            >
                              {trip.trip_name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatDate(trip.start_date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatDate(trip.end_date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatBudget(trip.total_budget)}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(status)}</td>
                          <td className="px-6 py-4">
                            <Link
                              to={`/trips/${trip.trip_id}`}
                              className="text-sm text-indigo-600 hover:underline"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Plan Trip Modal */}
      <PlanTripModal
        open={showPlanTrip}
        onClose={() => {
          setShowPlanTrip(false);
          loadTrips(); // Refresh trips after modal closes
        }}
      />
    </div>
  );
}
