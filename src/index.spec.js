require('expose?jQuery!jquery');
require('angular');
require('angular-mocks');
require('./vendor/vendor');

var testsContext = require.context('.', true, /([a-zA-Z0-9_-]+)\/.+(\.spec\.js)+/);
testsContext.keys().forEach(testsContext);
