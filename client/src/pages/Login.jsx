import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      
      if (response.data.success) {
        toast.success("Login successful!");
        // Store user data in localStorage (in a real app, you might use context or a state management solution)
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-grow flex justify-center items-center">
        <div className="border shadow p-6 w-80 bg-white">
          <h2 className="text-3xl font-bold mb-4 text-black">Login</h2>
          <form className="text-black" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xl text-gray-700" htmlFor="email">
                Email
              </label>
              <input
                className="w-full text-lg px-3 py-2 border"
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter Email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-xl text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                className="w-full text-lg px-3 py-2 border"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter Password"
                required
              />
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="w-full text-xl bg-teal-600 text-white py-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <p className="text-center text-lg mt-4">
                Don't have an account? <Link to="/register" className="text-teal-600">Register</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;