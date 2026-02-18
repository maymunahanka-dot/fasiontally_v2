import "./CircularStat.css";

const CircularStat = ({ percentage, label, subLabel, color, size = 180 }) => {
  console.log("🔵 CircularStat rendered with props:", {
    percentage,
    label,
    subLabel,
    color,
    size,
  });

  const strokeWidth = size > 120 ? 15 : 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  console.log("🔵 CircularStat calculations:", {
    strokeWidth,
    radius,
    circumference,
    offset,
    percentageUsed: percentage,
  });

  return (
    <div className="circular-stat-container">
      <div
        className="circular-stat-wrapper"
        style={{ width: size, height: size }}
      >
        {/* Background Circle */}
        <svg className="circular-svg">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="progress-circle"
          />
        </svg>

        {/* Center Text */}
        <div className="circular-stat-text">
          {subLabel ? (
            <span className="stat-main-text">{subLabel}</span>
          ) : (
            <span className="stat-main-text">{percentage}%</span>
          )}
          <span className="stat-label-text">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default CircularStat;
