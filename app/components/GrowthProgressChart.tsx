type GrowthProgressChartProps = {
  percent: number;
  className?: string;
  showRing?: boolean;
};

function buildProgressSeries(percent: number, count = 14): number[] {
  const target = Math.min(100, Math.max(0, percent)) / 100;
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const eased = 1 - (1 - t) ** 2.2;
    return eased * target;
  });
}

export function GrowthProgressChart({
  percent,
  className = "",
  showRing = true,
}: GrowthProgressChartProps) {
  const width = 320;
  const height = 120;
  const padX = 12;
  const padY = 16;
  const values = buildProgressSeries(percent);
  const step = (width - padX * 2) / (values.length - 1);

  const points = values.map((value, index) => {
    const x = padX + index * step;
    const y = padY + (1 - value) * (height - padY * 2);
    return { x, y };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const displayPercent = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div className={`flex min-h-0 flex-1 items-center gap-4 sm:gap-5 ${className}`}>
      {showRing ? (
        <div className="growth-level-ring shrink-0" aria-hidden>
          <span className="font-display text-[clamp(1.35rem,2.5vw,1.85rem)] leading-none text-garden-light">
            {displayPercent}
          </span>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="font-sans text-[10px] lowercase tracking-wide text-garden-light/50 sm:text-[11px]">
          goal level
        </p>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-2 h-[5.5rem] w-full sm:h-[6.5rem]"
          aria-hidden
        >
          <line
            x1={padX}
            y1={height - padY}
            x2={width - padX}
            y2={height - padY}
            stroke="rgba(247, 245, 240, 0.12)"
            strokeWidth="1"
          />
          <polyline
            fill="none"
            stroke="#4FAF6F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polyline}
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={index === points.length - 1 ? 4 : 2.5}
              fill={index === points.length - 1 ? "#F7F5F0" : "#4FAF6F"}
              stroke={index === points.length - 1 ? "#4FAF6F" : "none"}
              strokeWidth={index === points.length - 1 ? 2 : 0}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
