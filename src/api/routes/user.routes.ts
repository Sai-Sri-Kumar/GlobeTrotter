import { register } from "../controllers/user/register.controller";
import { login } from "../controllers/user/login.controller";
import { getMe } from "../controllers/user/me.controller";
import { homeOverview } from "../controllers/user/home";
import { getMyTrips } from "../controllers/user/trip";
import { searchController } from "../controllers/user/search";
import { getCountries } from "../controllers/user/country";
import { getActivities } from "../controllers/user/activity";
import { createTrip } from "../controllers/user/create-trip";

export const authRoutes = {
  "/api/user/login": {
    POST: login,
  },
  "/api/user/me": {
    GET: getMe,
  },

  "/api/user/register": {
    POST: register,
  },
  "/api/trips/my": {
    GET: getMyTrips,
  },

  "/api/home/overview": {
    GET: homeOverview,
  },
  "/api/search": {
    GET: searchController,
  },

  "/api/countries": {
    GET: getCountries,
  },

  "/api/activities": {
    GET: getActivities,
  },

  "/api/trips/create": {
    POST: createTrip,
  },
};
