import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/auth.context";
import LoginImg from "../assets/login.jpg";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
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
      await login(form);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* LEFT – IMAGE */}
      <div className="hidden md:flex w-1/2 h-screen">
        <img
          src={LoginImg}
          alt="Login illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT – FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold text-black mb-2">Welcome back</h1>

          <p className="text-gray-600 text-sm mb-6">
            Sign in to continue your journey with GlobeTrotter.
          </p>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-black font-medium cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
