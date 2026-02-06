const TrafficLightSection = ({ result }) => (
  <div className="border rounded p-4">
    <div className="font-medium">Traffic Light</div>
    <div className="text-lg">{result.color}</div>
    <div className="text-sm">
      Bonus: ₹{result.bonus}
    </div>
  </div>
);

export default TrafficLightSection;
