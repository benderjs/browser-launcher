exports.safari = require( './safari' );
exports.firefox = require( './firefox' );
exports['firefox-nightly'] = require( './firefoxnightly' );
exports.chrome = exports[ 'google-chrome' ] = require( './chrome' );
exports.canary = exports[ 'google-chrome-canary' ] = require( './canary' );
exports.opera = require( './opera' );
