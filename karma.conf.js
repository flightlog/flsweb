module.exports = function (config) {
  var webpackConfig = require('./webpack.config.js');
  var minimist = require('minimist');
  var os = require('os');
  var TARGET = minimist(process.argv.slice(2)).TARGET || 'PROD';

  var configObject = {
    basePath: 'src',
    frameworks: ['jasmine'],
    files: ['index.spec.js'],
    reporters: ['dots'],
    preprocessors: {
      'index.spec.js': ['webpack', 'sourcemap']
    },
    webpack: {
      module: webpackConfig.module,
      resolve: webpackConfig.resolve,
      devtool: 'inline-source-map'
    },
    webpackMiddleware: {
      noInfo: true
    }
  };

  if (TARGET === 'PROD') {
    configObject.browsers = ['PhantomJS'];
  }

  if (TARGET === 'DEV') {
    configObject.browsers = ['Chrome'];
  }

  config.set(configObject);
};
