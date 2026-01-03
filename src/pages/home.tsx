import { useEffect, useState } from "react";
import { useAuth } from "../context/auth.context";
import SearchDropdown from "../components/SearchDropdown";
import PlanTripModal from "../components/PlanTripModal";

/* ---------------- TYPES ---------------- */

type Country = {
  country_id: number;
  country_name: string;
  region: string;
};

type Activity = {
  activity_id: number;
  name: string;
  activity_type: string;
  cost: number;
  rating: number;
};

type Trip = {
  trip_id: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  total_budget: number;
};

type SearchResult = {
  countries: Country[];
  activities: Activity[];
};

/* ---------------- COMPONENT ---------------- */

export default function Home() {
  const { user, loading } = useAuth();

  const [countries, setCountries] = useState<Country[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [showPlanTrip, setShowPlanTrip] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  /* ---------- LOAD HOME DATA ---------- */
  useEffect(() => {
    loadHome();
  }, [user]);

  async function loadHome() {
    try {
      const res = await fetch("/api/home/overview");
      const data = await res.json();

      setCountries(data.countries?.length ? data.countries : fallbackCountries);
      setActivities(
        data.activities?.length ? data.activities : fallbackActivities,
      );
    } catch {
      setCountries(fallbackCountries);
      setActivities(fallbackActivities);
    }

    if (user) {
      try {
        const tripRes = await fetch("/api/trips/my", {
          credentials: "include",
        });
        if (tripRes.ok) {
          setTrips(await tripRes.json());
        }
      } catch {
        setTrips([]);
      }
    }

    setInitialLoading(false);
  }

  /* ---------- SEARCH ---------- */
  useEffect(() => {
    if (!search || search.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        setResults(await res.json());
      } catch {
        setResults({ countries: [], activities: [] });
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  if (loading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading GlobalTrotter…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-indigo-600">
            GlobalTrotter
          </h1>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">
                {user.first_name?.[0]}
              </div>
              <span className="text-sm font-medium">{user.first_name}</span>
            </div>
          ) : (
            <button className="px-5 py-2 text-sm border rounded-full hover:bg-slate-100">
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* ================= HERO + SEARCH ================= */}
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-8 py-24 text-center">
          <h2 className="text-5xl font-semibold mb-6">Where to?</h2>
          <p className="text-slate-600 mb-12">
            Discover destinations and experiences around the world
          </p>

          <div className="relative max-w-3xl mx-auto">
            <div className="flex items-center bg-white border border-slate-200 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSearch(true);
                }}
                className="flex-1 px-6 py-4 outline-none bg-transparent"
                placeholder="Search countries or activities…"
              />
              <button
                disabled={search.length < 2}
                className="px-10 py-4 bg-indigo-600 text-white rounded-full disabled:opacity-40"
              >
                Search
              </button>
            </div>

            <SearchDropdown
              open={showSearch}
              searching={searching}
              results={results}
              onClose={() => setShowSearch(false)}
            />
          </div>
        </div>
      </section>

      {/* ================= TOP DESTINATIONS ================= */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <h3 className="text-2xl font-semibold mb-8">Top Destinations</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {countries.map((c) => (
            <div
              key={c.country_id}
              className="h-52 rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-end hover:shadow-md transition"
            >
              <h4 className="text-lg font-semibold">{c.country_name}</h4>
              <p className="text-sm text-slate-500">{c.region}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= ACTIVITIES ================= */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <h3 className="text-2xl font-semibold mb-8">Things to Do</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {activities.map((a) => (
              <div
                key={a.activity_id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-white hover:shadow transition"
              >
                <h4 className="font-semibold">{a.name}</h4>
                <p className="text-sm text-slate-500">{a.activity_type}</p>

                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-emerald-600 font-medium">
                    ₹ {a.cost}
                  </span>
                  <span>⭐ {a.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= USER TRIPS ================= */}
      {user && (
        <section className="max-w-7xl mx-auto px-8 py-20">
          <h3 className="text-2xl font-semibold mb-8">Your Trips</h3>

          {trips.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-2xl p-10 text-slate-500">
              You haven’t planned a trip yet.
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {trips.map((t) => (
                <div
                  key={t.trip_id}
                  className="min-w-[280px] rounded-2xl border border-slate-200 bg-white p-5 hover:shadow transition"
                >
                  <h4 className="font-semibold">{t.trip_name}</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {t.start_date} → {t.end_date}
                  </p>
                  <p className="mt-4 text-emerald-600 font-medium">
                    Budget: ₹ {t.total_budget}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================= CTA ================= */}
      <button
        onClick={() => setShowPlanTrip(true)}
        className="fixed bottom-6 right-6 bg-emerald-500 text-white px-7 py-3 rounded-full shadow-xl hover:bg-emerald-600"
      >
        + Plan a Trip
      </button>

      <PlanTripModal
        open={showPlanTrip}
        onClose={() => setShowPlanTrip(false)}
      />
    </div>
  );
}

/* ---------------- FALLBACK DATA ---------------- */

const fallbackCountries: Country[] = [
  { country_id: 1, country_name: "Japan", region: "Asia" },
  { country_id: 2, country_name: "France", region: "Europe" },
  { country_id: 3, country_name: "Italy", region: "Europe" },
];

const fallbackActivities: Activity[] = [
  {
    activity_id: 1,
    name: "City Walk",
    activity_type: "Sightseeing",
    cost: 500,
    rating: 4.5,
  },
  {
    activity_id: 2,
    name: "Food Tour",
    activity_type: "Culinary",
    cost: 1200,
    rating: 4.7,
  },
];
