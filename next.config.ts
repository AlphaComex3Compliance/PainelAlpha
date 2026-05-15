const nextConfig = {
  transpilePackages: ["pusher-js"],
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },

  // Turbopack: config vazio para silenciar aviso de webpack-sem-turbopack
  turbopack: {},
};

export default nextConfig;
