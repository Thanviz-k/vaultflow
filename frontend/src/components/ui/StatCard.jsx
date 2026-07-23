
function StatCard({
    icon,
    title,
    value,
    color,
    onClick
}) {
    return (
        <div
            className="stat-card hover-card"
            onClick={onClick}
            style={{
                borderTop: `4px solid ${color}`
            }}
        >
            <div
                className="stat-icon"
                style={{
                    backgroundColor: color
                }}
            >
                {icon}
            </div>

            <div className="stat-content">
                <h2 className="stat-value">{value}</h2>
                <p className="stat-title">{title}</p>
            </div>
        </div>
    );
}

export default StatCard ;
