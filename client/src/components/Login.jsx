import React, { useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login, logout } from "../features/auth/authSlice.js";
import { IoEyeOff, IoEye } from "react-icons/io5";

axios.defaults.withCredentials = true;

const Login = () => {
  const [formData, setFormData] = useState({ auth: "", password: "" });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/user/login", formData);
      toast.success(response.data.message);

      if (!response.data.user) {
        dispatch(logout());
      } else {
        dispatch(login(response.data.user));
        localStorage.setItem("user", response.data.user._id);
        sessionStorage.setItem("token", response.data.accessToken);
        setLoading(false);
        navigate("/");
      }

      setFormData({ auth: "", password: "" });
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setLoading(false);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="h-full flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-[#6c9b31] font-[Sukar] mb-2">
          Welcome Back!
        </h1>
        <p className="text-center text-gray-500 font-[Open Sans] mb-6">
          Login to continue managing your projects
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Auth field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1 font-[Open Sans]">
              Email / Phone No.
            </label>
            <input
              type="text"
              name="auth"
              autoComplete="username"
              value={formData.auth}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg outline-none font-[Open Sans] 
                        focus:ring-2 focus:ring-[#94cd4d] focus:border-[#6c9b31]"
              placeholder="Enter your email or phone"
              required
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1 font-[Open Sans]">
              Password
            </label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border-none outline-none font-[Open Sans]"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <span
                className="px-3 text-gray-500 cursor-pointer hover:text-[#6c9b31]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <NavLink
              to="/resetpasswd"
              className="text-sm text-[#6c9b31] hover:text-[#94cd4d] font-medium"
            >
              Forgot Password?
            </NavLink>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-[#94cd4d] text-white font-semibold py-3 rounded-lg 
                       hover:bg-[#6c9b31] transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Logging..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center justify-center">
          <span className="h-px w-1/3 bg-gray-200"></span>
          <span className="px-3 text-gray-400 text-sm font-[Open Sans]">
            OR
          </span>
          <span className="h-px w-1/3 bg-gray-200"></span>
        </div>

        {/* Register button */}
        <button
          onClick={() => navigate("/register")}
          className="w-full bg-white border border-[#94cd4d] text-[#6c9b31] font-semibold py-3 rounded-lg 
                     hover:bg-[#eeffda] transition-all duration-200"
        >
          Register
        </button>

        {/*  Error */}
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </section>
    </div>
  );
};

export default Login;
