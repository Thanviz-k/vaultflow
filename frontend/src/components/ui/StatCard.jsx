function StatCard({

  icon,

  title,

  value,

  color = "#4F46E5",

}) {

  return (

    <div className="stat-card">

      <div
        className="stat-icon"
        style={{
          background: color,
        }}
      >

        {icon}

      </div>

      <div className="stat-content">

        <h2 className="stat-value">

          {value}

        </h2>

        <p className="stat-title">

          {title}

        </p>

      </div>

    </div>

  );

}

export default StatCard;