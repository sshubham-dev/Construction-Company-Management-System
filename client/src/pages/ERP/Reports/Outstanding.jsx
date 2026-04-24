import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Outstanding = () => {
  const [type, setType] = useState("Client");
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  /* ======================
     FETCH DATA
  ====================== */

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Searching outstanding with: ", {
        companyId: user.companyId,
        type,
      });
      const res = await axios.get(
        `/api/v1/reports/outstanding?companyId=${user.companyId}&type=${type}`,
      );

      // if (!res.ok) throw new Error("Failed to fetch");

      const json = res.data;
      console.log("outstanding: ", json);

      // 🔥 sort by highest outstanding
      const sorted = json.sort(
        (a, b) => Math.abs(b.balance) - Math.abs(a.balance),
      );

      setData(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, user.companyId]);

  /* ======================
     SEARCH FILTER
  ====================== */

  useEffect(() => {
    const result = data.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()),
    );
    setFiltered(result);
  }, [search, data]);

  /* ======================
     TOTAL
  ====================== */

  const total = filtered.reduce((sum, r) => sum + r.balance, 0);

  /* ======================
     UI
  ====================== */

  return (
    <div style={{ padding: "20px" }}>
      <h2>Outstanding</h2>

      {/* TOGGLE */}
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => setType("Client")}
          style={{
            background: type === "Client" ? "#ddd" : "",
          }}
        >
          Clients
        </button>

        <button
          onClick={() => setType("Contractor")}
          style={{
            background: type === "Contractor" ? "#ddd" : "",
          }}
        >
          Contractors
        </button>

        <button
          onClick={() => setType("Supplier")}
          style={{
            background: type === "Supplier" ? "#ddd" : "",
          }}
        >
          Suppliers
        </button>
        
        <button
          onClick={() => setType("Employee")}
          style={{
            background: type === "Employee" ? "#ddd" : "",
          }}
        >
          Employees
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "10px", padding: "5px" }}
      />

      {/* TOTAL */}
      <h4>
        Total:{" "}
        <span style={{ color: total >= 0 ? "green" : "red" }}>
          ₹ {total.toLocaleString()}
        </span>
      </h4>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* TABLE */}
      {!loading && !error && (
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((row) => (
              <tr key={row.ledgerId}>
                <td
                  style={{ cursor: "pointer", color: "blue" }}
                  onClick={() =>
                    (window.location.href = `/ledger/${row.ledgerId}`)
                  }
                >
                  {row.name}
                </td>

                <td>₹ {row.debit.toLocaleString()}</td>
                <td>₹ {row.credit.toLocaleString()}</td>

                <td
                  style={{
                    color:
                      row.balance > 0
                        ? "green"
                        : row.balance < 0
                          ? "red"
                          : "black",
                    fontWeight: "bold",
                  }}
                >
                  ₹ {row.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Outstanding;
