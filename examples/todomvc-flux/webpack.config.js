var webpack = require('webpack');

module.exports = {
  devtool: "eval",
  entry: {
    app: [
      "webpack-dev-server/client?http://0.0.0.0:3334",
      "webpack/hot/only-dev-server",
      "./js/app.js"
    ]
  },
  output: {
    path: "./assets/js",
    pathinfo: true,
    filename: "bundle.js"
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.json'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: "react-hot!jsx",
        exclude: /node_modules/
      },

      {
        test: /\.(html|png|otf|eot|svg|ttf|woff)$/,
        loader: "file?name=[path][name].[ext]&context=./src"
      }
    ]
  }
};
