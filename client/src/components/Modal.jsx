// src/components/Modal.js
import React from 'react';

const Modal = ({ isOpen, onClose, children, head }) => {
    if (!isOpen) return null; // If the modal is not open, return null

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] lg:h-[85vh] md:mt-12 overflow-auto relative">
                <h2 className="text-2xl font-bold mb-4">{head}</h2>
                <button onClick={onClose} className="absolute top-4 right-5 text-gray-500 hover:text-gray-900 font-bold text-3xl">
                   &times;
                </button>
                {children} {/* Render children (the form) */}
            </div>
        </div>
    );
};

export default Modal;