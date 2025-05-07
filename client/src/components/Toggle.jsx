import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";


const Toggle = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { user } = useSelector((state) => state.auth);


  return (
    <div className="flex items-center justify-between p-4 border rounded-xl shadow-md w-full">
      <span>Toggle</span>
      <button
        className={`w-14 h-8 rounded-full transition-colors duration-300 ${
          isEnabled ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        ></div>
      </button>
    </div>
  );
};

export default Toggle;
