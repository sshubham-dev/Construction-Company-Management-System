import React from 'react'
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';

const CRMScreen = () => {
  return (
    <div >
    <Header category="Page" title="CRM Screen" />
    <section className='container mx-auto mt-4 mb-16'>
        <div className='overflow-x-auto w-full max-w-screen-xl mx-auto'></div>
        <Toaster
            position="top-right"
            reverseOrder={false}
        />
    </section>
</div>
  )
}

export default CRMScreen