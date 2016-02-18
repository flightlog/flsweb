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
    var instanbulInstrumenterLoader = {
      test: /\.js/,
      loader: 'istanbul-instrumenter',
      exclude: /(node_modules|vendor|\.spec\.js)/
    };

    if (webpackConfig.module.postLoaders) {
      webpackConfig.module.postLoaders.push(instanbulInstrumenterLoader);
    } else {
      webpackConfig.module.postLoaders = [instanbulInstrumenterLoader];
    }

    configObject.reporters = configObject.reporters.concat(['junit', 'coverage']);
    configObject.coverageReporter = {
      dir: '../target/site/cobertura',
      reporters: [
        {type: 'html', subdir: 'coverage-html'},
        {type: 'cobertura', subdir: '.', file: 'coverage.xml'},
        {type: 'text-summary', subdir: '.', file: 'text-summary.txt'}
      ]
    };
    configObject.junitReporter = {
      outputDir: '../target/surefire-reports'
    };
  }

  if (TARGET === 'DEV') {
    configObject.browsers = ['Chrome'];
  }

  config.set(configObject);
};
