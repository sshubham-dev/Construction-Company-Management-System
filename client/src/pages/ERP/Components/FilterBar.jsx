import { useState } from "react";

const FilterBar = ({ onApply }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div style={{ marginBottom: 10 }}>
      <input type="date" onChange={(e) => setFrom(e.target.value)} />
      <input type="date" onChange={(e) => setTo(e.target.value)} />

      <button onClick={() => onApply({ from, to })}>
        Apply
      </button>
    </div>
  );
};

export default FilterBar;