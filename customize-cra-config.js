import { theme } from './src/config/theme/themeVariables';

const CracoLessPlugin = require('craco-less');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          path: false,
        },
      },
    },
    test: /\.m?jsx?$/,
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              ...theme,
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
