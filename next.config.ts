import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // yahoo-finance2 bundles test utilities that reference Deno-specific modules.
  // Mark it as a server-external package so Next.js doesn't try to webpack-bundle it.
  serverExternalPackages: ["yahoo-finance2"],
};

export default nextConfig;
