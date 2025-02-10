import React, {useState} from 'react'

const Select = ({ option, isMulti = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const options = [
      { value: "1", label: "Option 1" },
      { value: "2", label: "Option 2" },
      { value: "3", label: "Option 3" },
      { value: "4", label: "Option 4" },
    ];
  
    // Filter options based on search query
    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    // Handle option selection
    const handleSelect = (option) => {
      if (isMulti) {
        if (selectedOptions.includes(option)) {
          setSelectedOptions(selectedOptions.filter((item) => item !== option));
        } else {
          setSelectedOptions([...selectedOptions, option]);
        }
      } else {
        setSelectedOptions([option]);
        setIsOpen(false); // Close dropdown after selection
      }
    };
  
    // Remove selected option
    const removeOption = (option) => {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    };
  
    return (
      <div className="relative w-full sm:w-64">
        {/* Input and Dropdown Toggle */}
        <div
          className="flex items-center justify-between p-2 border rounded cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-2">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {option.label}
                  {isMulti && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(option);
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            ) : (
              <span className="text-gray-500">Select an option</span>
            )}
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "transform rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
  
        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 w-full sm:w-64 mt-2 bg-white border rounded shadow-lg">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border-b focus:outline-none"
            />
  
            {/* Options List */}
            <ul className={` ${searchQuery !== '' ? 'h-20' : 'h-0'} overflow-y-auto`}>
              {filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedOptions.includes(option) ? "bg-blue-50" : ""
                    }`}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

export default Select