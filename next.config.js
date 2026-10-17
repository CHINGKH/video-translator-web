/** @type {import('next').NextConfig} */
const nextConfig = {
  // អនុញ្ញាតឱ្យបង្ហោះឯកសារធំជាងនេះបន្តិច (សមស្របសម្រាប់វីដេអូខ្លី)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
