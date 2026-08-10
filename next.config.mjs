/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // en + es from day one. Localisation is configuration, not a rebuild.
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};
export default nextConfig;
