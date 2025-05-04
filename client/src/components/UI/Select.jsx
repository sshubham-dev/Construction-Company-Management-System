import React, { useState, useRef, useEffect } from "react";

const Select = ({ multiSelect = false, style, options }) => {
  // const [options, setOptions] = useState([
  //   "Apple", "Banana", "Cherry", "Mango", "Orange"
  // ]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelection = (option) => {
    if (multiSelect) {
      if (!selectedOptions.includes(option)) {
        setSelectedOptions([...selectedOptions, option]);
      }
    } else {
      setSelectedOption(option)
    }
    setSearch("");
    setIsDropdownOpen(false);
  };

  const handleRemoveOption = (option) => {
    setSelectedOptions(selectedOptions.filter((item) => item !== option));
  };

  const handleAddOption = () => {
    if (search.trim() && !options.includes(search.trim())) {
      setOptions([...options, search.trim()]);
      setSelectedOptions([...selectedOptions, search.trim()]);
      setSearch("");
      setIsDropdownOpen(false);
    }
  };

  const handleAdd = () => { };

  return (
    <div className="p-4" ref={dropdownRef}>
      <div className="flex flex-wrap gap-1 p-2 border rounded-md cursor-pointer bg-gray-100 w-80" onClick={() => setIsDropdownOpen(true)}>
        {multiSelect ?
          <>
            {selectedOptions.map((option, index) => (
              <div key={index} className="bg-blue-200 px-2 py-1 rounded-md flex items-center gap-1">
                {option}
                <span className="cursor-pointer text-red-500" onClick={(e) => { e.stopPropagation(); handleRemoveOption(option); }}>
                  ×
                </span>
              </div>
            ))}
          </> :
          <>
            <div 
            // className={`${selectedOption ? "bg-blue-200 px-2 py-1 rounded-md flex items-center gap-2" : ""}`}
            >
              {selectedOption}
              {/* <span className="cursor-pointer text-red-500" onClick={() => setSelectedOption('')} >
                {selectedOption ? 'x' : ""}
              </span> */}
            </div>
          </>
        }
        <input
          type="text"
          placeholder="Select or search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow bg-transparent outline-none"
          onClick={() => setIsDropdownOpen(true)}
        />
      </div>
      {isDropdownOpen && (
        <div className="absolute w-80 bg-white border rounded-md shadow-lg mt-1 p-2 z-10">
          <div className="max-h-40 overflow-auto border p-2 rounded-md">
            {options.filter(option => option.toLowerCase().includes(search.toLowerCase()) && !selectedOptions.includes(option)).map((option, index) => (
              <div key={index} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelection(option)}>
                {option}
              </div>
            ))}
            {search.trim() && !options.includes(search.trim()) && (
              <div className="p-2 bg-green-100 cursor-pointer" onClick={handleAddOption}>
                Add "{search.trim()}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
