const TargetsSection = ({ targets }) => (
  <div className="space-y-4">
    <h2 className="font-semibold">Targets</h2>

    {targets.map((t, i) => (
      <div key={i} className="border rounded p-4">
        <div className="font-medium mb-2">
          {t.type}
        </div>

        {t.type === "SITE_WORK" &&
          t.works.map((w, idx) => (
            <div
              key={idx}
              className="text-sm flex justify-between"
            >
              <span>{w.workName}</span>
              <span>{w.status}</span>
            </div>
          ))}

        {t.type === "REVENUE" && (
          <div className="text-sm">
            Target: {t.revenueTarget.targetValue} <br />
            Achieved: {t.revenueTarget.achievedRevenue}
          </div>
        )}
      </div>
    ))}
  </div>
);

export default TargetsSection;
