import { useState } from "react";
import API from "../services/api";

function Register({ setPage }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
        })
      );

      setPage("dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold">
          Clinic<span className="text-cyan-400">Flow</span>
        </h1>

        <p className="text-slate-400 mt-2 mb-8">
          Create a patient account to view and track appointments.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="Input"
            placeholder="Full name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          <input
            className="Input"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <input
            className="Input"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold py-4 rounded-2xl transition">
            Create Account
          </button>
        </form>

        {message && <p className="text-red-400 text-sm mt-4">{message}</p>}

        <p className="text-slate-400 text-sm mt-6">
          Already have an account?{" "}
          <button
            onClick={() => setPage("login")}
            className="text-cyan-400 font-bold"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;