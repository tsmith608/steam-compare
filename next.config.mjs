/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Script sources are left open for AdSense/Analytics; this policy only
  // blocks framing, <base> hijacking and plugins.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // Old bot messages linked here; the route never existed.
      { source: "/dashboard/:id(\\d{17})", destination: "/:id", permanent: true },
      { source: "/profile/:id", destination: "/:id", permanent: true },
      { source: "/commands", destination: "/discord", permanent: true },
    ];
  },
};

export default nextConfig;
