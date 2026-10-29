type SeedSparklineProps = {
  values: number[];
  direction: "up" | "down";
  className?: string;
  inCircle?: boolean;
};

export function SeedSparkline({
  values,
  direction,
  className = "",
  inCircle = false,
}: SeedSparklineProps) {
  const width = inCircle ? 52 : 88;
  const height = inCircle ? 52 : 28;
  const pad = inCircle ? 10 : 2;

  if (values.length < 2) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`shrink-0 opacity-35 ${inCircle ? "h-[3.25rem] w-[3.25rem]" : ""} ${className}`}
        aria-hidden
      >
        {inCircle ? (
          <circle
            cx={width / 2}
            cy={height / 2}
            r={width / 2 - 2}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            className="text-[#24332F]/12"
          />
        ) : null}
        <line
          x1={pad}
          y1={height / 2}
          x2={width - pad}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth="1"
          className="text-[#24332F]/25"
        />
      </svg>
    );
  }

  const step = (width - pad * 2) / (values.length - 1);
  const coords = values.map((value, index) => ({
    x: pad + index * step,
    y: pad + (1 - value) * (height - pad * 2),
  }));
  const points = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const last = coords[coords.length - 1];
  const stroke = direction === "up" ? "#4a7356" : "#9B7B80";
  const dotStroke = direction === "up" ? "#3d6b4a" : "#8a6368";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`shrink-0 ${inCircle ? "h-[3.25rem] w-[3.25rem]" : ""} ${className}`}
      aria-hidden
    >
      {inCircle ? (
        <circle
          cx={width / 2}
          cy={height / 2}
          r={width / 2 - 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          className="text-[#24332F]/10"
        />
      ) : null}
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={inCircle ? 1.35 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={inCircle ? 2.75 : 2}
        fill="#F7F5F0"
        stroke={dotStroke}
        strokeWidth={1.25}
      />
    </svg>
  );
}
