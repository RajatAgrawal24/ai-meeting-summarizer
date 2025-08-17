/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '2mb', // adjust as needed
    },
  },
};
export default nextConfig;
