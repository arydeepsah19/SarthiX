/**
 * PageWrapper — wraps each page with consistent padding, max-width and gap.
 * Responsive: tighter padding on small screens.
 */
export default function PageWrapper({ children }) {
  return (
    <div
      style={{
        maxWidth: 1200,
        padding: "clamp(14px, 3vw, 28px)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}
