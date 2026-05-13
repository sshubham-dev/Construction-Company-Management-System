const Drawer = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-[420px] bg-white h-full p-4 overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h3 className="font-medium">Form</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Drawer;