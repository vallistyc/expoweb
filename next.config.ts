import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rrblgddxkrylakuynswz.supabase.co",
        pathname: "/storage/v1/object/public/univ-logo/**", 
      },
      {
        protocol: "https",
        hostname: "rrblgddxkrylakuynswz.supabase.co",
        pathname: "/storage/v1/object/public/pemateri/**",
      },
      {
        protocol: "https",
        hostname: "rrblgddxkrylakuynswz.supabase.co",
        pathname: "/storage/v1/object/public/lembaga/**",
      },
      {
        protocol: "https",
        hostname: "rrblgddxkrylakuynswz.supabase.co",
        pathname: "/storage/v1/object/public/news/**",
      },
      {
        protocol: "https",
        hostname: "rrblgddxkrylakuynswz.supabase.co",
        pathname: "/storage/v1/object/public/Program/Thumbnail/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/logo-dummy-04.png",
      },
    ],
  },
};

export default nextConfig;