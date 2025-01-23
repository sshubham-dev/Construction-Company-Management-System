import React from 'react'
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';

const InventoryScreen = () => {
    return (
        <div >
            <Header category="Page" title="Inventory Screen" />
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

export default InventoryScreen