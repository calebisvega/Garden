type GardenWordmarkProps = {
  className?: string;
};

/** Display title — tightens G↔A only; A↔R spacing stays default */
export function GardenWordmark({ className = "" }: GardenWordmarkProps) {
  return (
    <span className={`garden-wordmark whitespace-nowrap ${className}`.trim()}>
      <span className="garden-wordmark-g">G</span>ARDEN
    </span>
  );
}
