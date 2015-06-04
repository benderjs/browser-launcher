var mkdirp = require( 'mkdirp' ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	package = require( '../package' ),
	osenv = require( 'osenv' ),
	defaultConfigFile = path.join( osenv.home(), '.config', package.name, 'config.json' );

exports.path = function( configFile ) {
	return configFile || defaultConfigFile;
};

exports.dir = function( configFile ) {
	return path.dirname( configFile || defaultConfigFile );
};

/**
 * Read a configuration file
 * @param {String}   [configFile] Path to the configuration file
 * @param {Function} callback     Callback function
 */
exports.read = function( configFile, callback ) {
	if ( typeof configFile === 'function' ) {
		callback = configFile;
		configFile = null;
	}

	fs.readFile( exports.path( configFile ), function( err, src ) {
		callback( err, src && JSON.parse( src ) );
	} );
};

/**
 * Write a configuration file
 * @param {String}   configFile Path to the configuration file
 * @param {Object}   config     Configuration object
 * @param {Function} callback   Callback function
 */
exports.write = function( configFile, config, callback ) {
	callback = callback || function() {};

	if ( typeof configFile === 'object' ) {
		callback = config;
		config = configFile;
		configFile = null;
	}

	mkdirp( exports.dir(configFile), function( err ) {
		if ( err ) {
			return callback( err );
		}

		fs.writeFile( exports.path(configFile), JSON.stringify( config, null, 2 ), callback );
	} );
};
