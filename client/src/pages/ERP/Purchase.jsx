import React from 'react'
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';

const Purchase = () => {
  return (
    <div>
      <Header category="Page" title="Purchase Management" />
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

export default Purchase