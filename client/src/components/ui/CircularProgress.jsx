export function CircularProgress({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  label,
  showPercentage = true 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (percent) => {
    if (percent >= 75) return '#22c55e'; // green
    if (percent >= 50) return '#3b82f6'; // blue
    if (percent >= 25) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };
}