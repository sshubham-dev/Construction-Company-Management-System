import { useEffect, useState } from "react";
import * as api from "../../api/fiscalYear";
import CreateFy from "./Components/CreateFy";
import Modal from "../../components/Modal";

const FiscalYear = () => {
  const [list, setList] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const res = await api.getFY(companyId);

    setList(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <button onClick={() => setOpen(true)}>New FY</button>

      <table>
        <tbody>
          {list.map((x) => (
            <tr key={x._id}>
              <td>{x.name}</td>

              <td>{x.isClosed ? "Closed" : "Open"}</td>

              <td>
                {!x.isClosed && (
                  <button onClick={() => api.closeFY(x._id)}>Close</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        head="Create Fiscal Year"
      >
        <CreateFy
          open={open}
          onSave={async (v) => {
            await api.createFY(v);

            load();
          }}
        />
      </Modal>
    </div>
  );
};

export default FiscalYear;
