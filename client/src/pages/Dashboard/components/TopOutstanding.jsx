const TopOutstanding = ({
  title,
  rows,
  color,
}) => {

  return (

    <div>

      <h3 className="mb-4 text-lg font-semibold">
        {title}
      </h3>

      <div className="space-y-3">

        {rows.slice(0,3).map((row,index)=>(
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border p-3"
          >

            <div>

              <p className="font-medium">
                {row.name}
              </p>

            </div>

            <div
              className={`font-semibold ${
                color==="green"
                  ?"text-green-600"
                  :"text-red-600"
              }`}
            >
              ₹{Number(row.amount).toLocaleString("en-IN")}
            </div>

          </div>
        ))}

      </div>

    </div>

  );

};

export default TopOutstanding;