var spawn = require( 'child_process' ).spawn,
	winDetect = require( 'win-detect-browsers' ),
	darwin = require( './darwin' ),
	path = require( 'path' ),
	phantomjs = require( 'phantomjs' ),
	extend = require( 'lodash' ).extend,
	browsers = {
		'google-chrome': {
			name: 'chrome',
			re: /Google Chrome (\S+)/,
			type: 'chrome',
			profile: true,
		},
		'chromium-browser': {
			name: 'chromium',
			re: /Chromium (\S+)/,
			type: 'chrome',
			profile: true,
		},
		'firefox': {
			name: 'firefox',
			re: /Mozilla Firefox (\S+)/,
			type: 'firefox',
			profile: true,
		},
		'phantomjs': {
			name: 'phantomjs',
			re: /(\S+)/,
			type: 'phantom',
			headless: true,
			profile: false,
		},
		'safari': {
			name: 'safari',
			type: 'safari',
			profile: false
		},
		'ie': {
			name: 'ie',
			type: 'ie',
			profile: false
		},
		'opera': {
			name: 'opera',
			re: /Opera (\S+)/,
			type: 'opera',
			image: 'opera.exe',
			profile: true
		}
	};

// extracted from karma-phantomjs-launcer (license MIT)
// https://github.com/karma-runner/karma-phantomjs-launcher/blob/master/index.js
function getPhatomjsCmd() {
	// If the path we're given by phantomjs is to a .cmd, it is pointing to a global copy.
	// Using the cmd as the process to execute causes problems cleaning up the processes
	// so we walk from the cmd to the phantomjs.exe and use that instead.

	var phantomSource = phantomjs.path;

	if ( path.extname(phantomSource).toLowerCase() === '.cmd' ) {
		return path.join(path.dirname( phantomSource ), '//node_modules//phantomjs//lib//phantom//phantomjs.exe');
	}

	return phantomSource;
}

function checkWindows( callback ) {
	winDetect( function( found ) {
		var available = found.map( function( browser ) {
			var br = browsers[ browserName ],
			browserName = (browser.name === 'chrome') ? 'google-chrome' : browser.name;

			return extend( {}, {
				name: browserName,
				command: browser.path,
				version: browser.version
			}, br || {} );
		} );

		available = available.filter( function( browser ) {
			return ( !/phantom/ig.test( browser.name ) );
		} );

		available.push( extend( browsers.phantomjs, {
			command: getPhatomjsCmd(),
			version: phantomjs.version,
		} ) );

		callback( available );
	} );
}

function checkDarwin( name, callback ) {
	if ( darwin[ name ] ) {
		if ( darwin[ name ].all ) {
			darwin[ name ].all( function( err, available ) {
				if ( err ) {
					callback( 'failed to get version for ' + name );
				} else {
					callback( err, available );
				}
			} );
		} else {
			darwin[ name ].version( function( err, version ) {
				if ( version ) {
					darwin[ name ].path( function( err, p ) {
						if ( err ) {
							return callback( 'failed to get path for ' + name );
						}

						callback( null, version, p );
					} );
				} else {
					callback( 'failed to get version for ' + name );
				}
			} );
		}
	} else {
		checkOthers( name, callback );
	}
}

function checkOthers( name, callback ) {
	if (/phantom/ig.test(name)) {
		return setImmediate(callback.bind(null, null, phantomjs.version, getPhatomjsCmd()));
	}

	var process = spawn( name, [ '--version' ] ),
		re = browsers[ name ].re,
		data = '';

	process.stdout.on( 'data', function( buf ) {
		data += buf;
	} );

	process.on( 'error', function() {
		callback( 'not installed' );
		callback = null;
	} );

	process.on( 'exit', function( code ) {
		if ( !callback ) {
			return;
		}

		if ( code !== 0 ) {
			return callback( 'not installed' );
		}

		var m = re.exec( data );

		if ( m ) {
			callback( null, m[ 1 ] );
		} else {
			callback( null, data.trim() );
		}
	} );
}

module.exports = function( callback ) {
	var available = [],
		names,
		check;

	if ( process.platform === 'win32' ) {
		return checkWindows( callback );
	} else if ( process.platform === 'darwin' ) {
		check = checkDarwin;
	} else {
		check = checkOthers;
	}

	names = Object.keys( browsers );

	function next() {
		var name = names.shift();

		if ( !name ) {
			return callback( available );
		}

		var br = browsers[ name ];

		check( name, function( err, v, p ) {
			if ( err === null ) {
				if ( Array.isArray( v ) ) {
					v.forEach( function( item ) {
						available.push( extend( {}, br, {
							command: item.path,
							version: item.version
						} ) );
					} );
				} else {
					available.push( extend( {}, br, {
						command: p || name,
						version: v
					} ) );
				}
			}

			next();
		} );
	}

	next();
};
