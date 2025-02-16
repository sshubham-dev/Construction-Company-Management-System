import React, {useState} from 'react'
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdDelete, MdAdd } from "react-icons/md";
import CreatePurchaseRequest from '../../components/CreatePurchaseRequest';
import Modal from '../../components/Modal';

const PurchaseRequest = () => {
  const navigate = useNavigate();
  const [createModal, setCreateModal] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const handleRedirect = (id) => {
    navigate(`/purchase-request/${id}`);
  };

  return (
    <div >
      <Header category="Page" title="Purchase Request" />
      <section className="h-full w-full mb-16 flex justify-center">
        <div className='overflow-x-auto w-full max-w-screen-xl mx-auto'>
          <div className="w-full mx-auto mb-6 text-gray-700 p-1 flex flex-row justify-between items-center">
            <h2 className="text-lg text-wrap sm:text-md md:text-lg lg:text-xl text-green-600 mr-4 pr-4">
            </h2>
            <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
              <MdAdd className='text-xl' />
            </button>
          </div>
        </div>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
      {/* Work Order Modal */}
      {createModal && (
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Purchase Request' >
          <CreatePurchaseRequest onClose={() => setCreateModal(false)} />
        </Modal>
      )}
    </div>
  )
}

export default PurchaseRequest