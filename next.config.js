const { i18n } = require('./next-i18next.config');
const fs = require('fs');
const path = require('path');



/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,

  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    config.module.rules.push({
      test: /\.ya?ml$/,
      type: 'json',
      use: 'yaml-loader',
    });
    

    if(isServer) {
      try {  
        const addinsPath = path.join(__dirname, 'addins');
        const addins = fs.readdirSync(addinsPath, { withFileTypes: true }).filter(
          file => file.isDirectory()
        ).map(file=>file.name);
        
        const manifestPath = path.join(__dirname, 'addins-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(addins));

      } catch (err) {
        console.error(err);
      }

      try {  
        const addonsPath = path.join(__dirname, 'addons');
        const addons = fs.readdirSync(addonsPath, { withFileTypes: true }).filter(
          file => file.isDirectory()
        ).map(file=>file.name);
        
        const manifestPath = path.join(__dirname, 'addons-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(addons));

      } catch (err) {
        console.error(err);
      }


    }

    return config;
  },
};

module.exports = nextConfig;
