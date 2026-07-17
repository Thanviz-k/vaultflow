function ProgressBar({
  percent,
  color,
}) {
  return (
    <div className="progress-bar">

      <div
        className="progress-fill"
        style={{
          width: `${percent}%`,
          background: color,
        }}
      />

    </div>
  );
}

export default ProgressBar;