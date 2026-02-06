const BonusSummary = ({ targetBonus, trafficBonus }) => {
  return (
    <div className="border rounded p-4 bg-gray-50">
      <h2 className="font-semibold mb-2">Final Bonus</h2>

      <div className="flex justify-between">
        <span>Target Bonus</span>
        <span>₹{targetBonus}</span>
      </div>

      <div className="flex justify-between">
        <span>Traffic Light Bonus</span>
        <span>₹{trafficBonus}</span>
      </div>

      <div className="flex justify-between font-semibold border-t mt-2 pt-2">
        <span>Total</span>
        <span>₹{targetBonus + trafficBonus}</span>
      </div>
    </div>
  );
};

export default BonusSummary;
