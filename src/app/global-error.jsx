"use client";

// Last-resort boundary (root layout failed). Plain markup, no app styles.
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ background: "#060708", color: "#f3f5f8", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28 }}>WeBothPlay hit a snag.</h1>
          <p style={{ color: "#b7bdc7" }}>Please try again in a moment.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "10px 18px", borderRadius: 10, border: 0, background: "#2563eb", color: "#fff", fontWeight: 600 }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
