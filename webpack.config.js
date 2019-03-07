const path = require('path');

module.exports = {
  mode: 'development',
  entry: './core/client/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        },
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      }
    ]
  },
  output: {
    filename: 'build.development.js',
    path: path.resolve(__dirname, 'dist/data')
  }
};