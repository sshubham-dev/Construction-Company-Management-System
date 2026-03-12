import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Modal from "../../components/Modal";
import CreateFaq from "../../components/CreateFaq";
import { MdDelete, MdAdd } from "react-icons/md";

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [addFaq, setAddFaq] = useState(false);
  const [search, setSearch] = useState("");
  

  const fetchFaqs = async () => {
    const res = await axios.get("/api/v1/faq/admin");
    console.log(res.data.data);
    setFaqs(res.data.data);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const filteredFaqs = useMemo(() => {
    if (!search) return faqs;

    return faqs.filter((faq) => {
      const text = `${faq.category} ${faq.question}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [faqs, search]);

  const deleteFaq = async (id) => {
    const confirmDelete = window.confirm("Delete this FAQ?");
    if (!confirmDelete) return;

    await axios.delete(`/api/v1/faq/${id}`);
    fetchFaqs();
  };

  return (
    <div className="relative p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">FAQ Manager</h2>
        </div>

        <div className="bg-white border rounded-xl p-3 m-2 shadow-sm">
          <input
            type="text"
            placeholder="Search FAQ..."
            className="w-full outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Desktop Table */}

        <div className="hidden md:block bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 text-left text-sm">
              <tr>
                <th className="p-4">Question</th>
                <th className="p-4">Category</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredFaqs?.map((faq) => (
                <tr key={faq._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-sm">{faq.question}</td>

                  <td className="p-4 text-sm capitalize">{faq.category}</td>

                  <td className="p-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {faq.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 flex gap-2">
                    <button className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">
                      Edit
                    </button>

                    <button
                      onClick={() => deleteFaq(faq._id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Layout */}

        <div className="md:hidden space-y-4">
          {filteredFaqs?.map((faq) => (
            <div key={faq._id} className="bg-white shadow rounded-xl p-4">
              <p className="font-medium mb-2">{faq.question}</p>

              <p className="text-sm text-gray-500 mb-2">
                Category: {faq.category}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {faq.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-yellow-500 text-white py-1 rounded text-sm">
                  Edit
                </button>

                <button
                  onClick={() => deleteFaq(faq._id)}
                  className="flex-1 bg-red-500 text-white py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}

        {filteredFaqs.length === 0 && (
          <div className="text-center text-gray-500 mt-10">No FAQs found</div>
        )}
        {/* Floating Add button */}
        <button
          onClick={() => setAddFaq(true)}
          className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition"
        >
          <MdAdd className="text-2xl" />
        </button>
      </div>
      <Modal isOpen={addFaq} onClose={() => setAddFaq(false)} head="Create FAQ">
        <CreateFaq onClose={() => setAddFaq(false)} />
      </Modal>
    </div>
  );
};

export default FAQs;
