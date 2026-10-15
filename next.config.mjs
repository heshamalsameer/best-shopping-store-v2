const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
