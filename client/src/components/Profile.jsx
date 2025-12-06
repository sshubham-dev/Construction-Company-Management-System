import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import convertToBase64 from "../helper/converter";
import { GrEdit } from "react-icons/gr";
import "./components.css";
import image from "../asset/profile.webp";
import { toggleNotifications } from "../helper/notificationService.js";
axios.defaults.withCredentials = true;

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [User, setUser] = useState({
    userName: "",
    userMail: "",
    phone: "",
    whatsapp: "",
    avatar: "",
  });
  const [toUpdate, setToUpdate] = useState(false);
  const [profileUpdate, setProfileUpdate] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [enabled, setEnabled] = useState(false);

  const inputData = async (event, field) => {
    const { name, value, type, files } = event.target;

    if (type === "file") {
      const file = files?.[0];
      if (!file) return;

      try {
        const base64 = await convertToBase64(file);

        // base64 used for instant preview
        setAvatar(base64);

        // file stored for backend FormData upload
        setUser((prevUser) => ({
          ...prevUser,
          [field]: file,
        }));
      } catch (err) {
        console.error("Error converting to Base64:", err);
      }
    } else {
      setUser((prevUser) => ({ ...prevUser, [name]: value }));
    }
  };

  useEffect(() => {
    if (user) {
      fetchUser(user?._id);
    }
  }, []);

  const handleToggle = async () => {
    const newState = await toggleNotifications(user?._id);
    setEnabled(newState);
  };

  const fetchUser = async (id) => {
    try {
      const response = await axios.get(`/api/v1/user/${id}`);
      // console.log(response.data.avatar);
      setUser({
        userName: response.data?.userName,
        userMail: response.data?.userMail,
        phone: response.data?.phone,
        whatsapp: response.data?.whatsapp,
        avatar: response.data?.avatar,
      });
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(User).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    });
    try {
      if (profileUpdate === true) {
        const response = await axios.put(
          `/api/v1/User/${user?._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // if (response.status === 201) {
        // console.log(response.data);
        toast.success("Updation successful!");
        setProfileUpdate(false);
        // }
      }
    } catch (error) {
      console.log("Error submitting form:", error);
      toast.error(error.message);
      toast.error("An error occurred while updating. Please try again.");
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 pb-6">
        <section className="mx-auto w-full md:w-3/4 lg:w-3/5 h-fit px-6 py-4 pb-8 bg-white rounded-2xl shadow-xl ">
          <form onSubmit={formSubmit}>
            {profileUpdate === false ? (
              <div className="profile flex justify-center mb-8">
                <img
                  src={avatar || User?.avatar || image}
                  className="border-4 border-gray-100 w-28 h-28 rounded-full shadow-lg cursor-pointer object-cover object-center"
                  alt="avatar"
                />
              </div>
            ) : (
              <div className="profile flex justify-center mb-8">
                <label htmlFor="avatar">
                  <img
                    src={avatar || User?.avatar || image}
                    className="border-4 border-gray-100 w-28 h-28 rounded-full shadow-lg cursor-pointer object-cover object-center"
                    alt="avatar"
                  />
                </label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  onChange={(e) => inputData(e, "avatar")}
                  accept=".png, .jpg, .jpeg"
                />
              </div>
            )}

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="userName"
                placeholder="Enter Your Name here"
                autoComplete="off"
                disabled={!profileUpdate}
                value={User.userName}
                onChange={inputData}
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="email"
                name="userMail"
                placeholder="Enter Your Email here"
                autoComplete="off"
                disabled={!profileUpdate}
                value={User.userMail}
                onChange={inputData}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="whatsapp"
                className="block text-gray-900 text-sm font-bold mb-1"
              >
                Contact Number
              </label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="tel"
                name="whatsapp"
                placeholder="Enter Your Whatsapp Number"
                autoComplete="off"
                disabled={!profileUpdate}
                value={User.whatsapp}
                onChange={inputData}
              />
            </div>

            <div className="mb-2">
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="tel"
                name="phone"
                placeholder="Enter Your Phone Number"
                autoComplete="off"
                disabled={!profileUpdate}
                value={User.phone}
                onChange={inputData}
              />
            </div>

            <div className="mb-4">
              <NavLink
                className="text-blue-600 font-medium hover:text-blue-700 text-sm hover:bg-blue-50 px-2"
                to={"/resetpasswd"}
              >
                Change Password?
              </NavLink>
            </div>

            {profileUpdate === true && (
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
              >
                Update
              </button>
            )}
          </form>
          {profileUpdate === false && (
            <button
              onClick={() => setProfileUpdate(true)}
              type="button"
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex flex-row gap-3 items-center justify-center"
            >
              <GrEdit /> Edit
            </button>
          )}
        </section>
        <div className="mb-4">
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>Notifications</span>
            <div
              onClick={handleToggle}
              style={{
                width: "45px",
                height: "24px",
                background: enabled ? "#4caf50" : "#ccc",
                borderRadius: "24px",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  background: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "2px",
                  left: enabled ? "22px" : "2px",
                  transition: "left 0.2s",
                }}
              />
            </div>
          </label>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Profile;
