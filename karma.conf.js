module.exports = function (config) {
    var webpackConfig = require('./webpack.config.js');
    var minimist = require('minimist');
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
        customLaunchers: {
            FlsChromeHeadless: {
                base: 'Chrome',
                flags: [
                    '--no-sandbox',
                    '--headless',
                    '--disable-gpu',
                    ' --remote-debugging-port=9222',
                ]
            }
        },
        webpackMiddleware: {
            noInfo: true
        }
    };

    if (TARGET === 'PROD') {
        configObject.browsers = ['FlsChromeHeadless'];
    }

    if (TARGET === 'DEV') {
        configObject.browsers = ['Chrome'];
    }

    config.set(configObject);
};
