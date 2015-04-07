var exec = require( 'child_process' ).exec,
	path = require( 'path' );

exports.exists = require( 'fs' ).exists;
exports.parse = require( 'plist' ).parseFile;

exports.find = function( id, callback ) {
	var pathQuery = 'mdfind "';

  if (!Array.isArray(id)) {
    id = [id];
  }
  for (var i = 0; i < id.length; i++) {
    pathQuery += 'kMDItemCFBundleIdentifier=="' + id[i] + '"';
    if (i !== id.length - 1) { //when this isn't the last one
      pathQuery += ' || ';
    }
  }
  pathQuery += '" | head -1';

	exec( pathQuery, function( err, stdout ) {
		var loc = stdout.trim();

		if ( loc === '' ) {
			loc = null;
			err = 'not installed';
		}

		callback( err, loc );
	} );
};

exports.getInfoPath = function( p ) {
	return path.join( p, 'Contents', 'Info.plist' );
};
