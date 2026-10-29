export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontSize: "2.2rem",
        fontWeight: 700,
        letterSpacing: "4px",
        textTransform: "uppercase",
        fontFamily: "'Libre Franklin', sans-serif",
        color: "currentColor",
        display: "inline-block",
        lineHeight: 1,
      }}
      aria-label="Luma Threads"
    >
      LUMA THREADS
    </span>
  );
}
