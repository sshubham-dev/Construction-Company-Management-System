import React from 'react'
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { useNavigate, useParams } from 'react-router-dom';

const PurchaseRequest = () => {
      const navigate = useNavigate();
  return (
    <div >
      <Header category="Page" title="Purchase Request" />
      <section className="h-full w-full mb-16 flex justify-center">
        <div className='overflow-x-auto w-full max-w-screen-xl mx-auto'>
        </div>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  )
}

export default PurchaseRequest