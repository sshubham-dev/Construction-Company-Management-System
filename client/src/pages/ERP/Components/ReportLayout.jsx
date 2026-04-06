const ReportLayout = ({ title, children }) => {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: "bold" }}>{title}</h2>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
};

export default ReportLayout;