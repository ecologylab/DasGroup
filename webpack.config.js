const path = require('path');
const webpack = require('webpack');
let basePath = '/';
module.exports = env => {
  if ( env.NODE_ENV != 'dev' ) { basePath = '/g/'; }
  return {
      entry: {
      path: path.join(__dirname, 'src/js/main.js'),
    },
    mode: env.NODE_ENV === 'production' ? 'production' : 'development',
    output: {
      path: path.resolve(__dirname, 'public/js'),
      filename: 'main.js',
    },
    module: {
      rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test:/\.css$/,
          use:['style-loader','css-loader']
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        Popper: ['popper.js', 'default']
      }),
      new webpack.DefinePlugin({
        BASEPATH : JSON.stringify(basePath),
        NODE_ENV : JSON.stringify(env.NODE_ENV),
      })
    ]
}
}
