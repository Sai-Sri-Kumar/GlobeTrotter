import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/auth.context";
import LoginImg from "../assets/login.jpg";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    city_name: "",
    country_name: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(form);

      navigate("/", { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  w-full flex  bg-white">
      {/* LEFT – IMAGE */}
      <div className="hidden md:flex w-1/2 h-screen">
        <img
          src={LoginImg}
          alt="Register illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT – FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome to GlobeTrotter
          </h1>

          <p className="text-gray-600 text-sm mb-6">
            Learn. Build. Travel smarter. Join a platform designed for modern
            learners and creators.
          </p>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-3">
              <input
                name="first_name"
                placeholder="First name"
                onChange={handleChange}
                className="input"
                required
              />
              <input
                name="last_name"
                placeholder="Last name"
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              className="input"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className="input"
              required
            />

            <input
              name="phone"
              placeholder="Phone (optional)"
              onChange={handleChange}
              className="input"
            />

            <div className="flex gap-3">
              <input
                name="city_name"
                placeholder="City"
                onChange={handleChange}
                className="input"
              />
              <input
                name="country_name"
                placeholder="Country"
                onChange={handleChange}
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-black font-medium cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
