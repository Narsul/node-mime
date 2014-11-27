var path = require('path');
var fs = require('fs');
var request = require('request');

// The canonical URL at which Apache's mime type mappings are located
var APACHE_TYPES = 'http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types';

// Local file for node.js community-specific mappings
var NODE_TYPES = 'node.types';

/**
 * Parse a types string (formatted like Apache's mime.types) for type
 * information
 *
 * @param typesMap {?Object}
 * @param typesString {String}
 */
function parseTypes(typesMap, typesString) {
  return typesString.split(/[\r\n]+/)
    .map(function(line) {
      return line.toLowerCase()
      .replace(/\s*#.*|^\s*|\s*$/g, '').split(/\s+/);
    })
    .filter(function(fields) {
      return fields.length > 1;
    })
    .reduce(function(types, fields) {
      var type = fields.shift();
      types[type] = types.hasOwnProperty(type) ?
                    types[type].concat(fields) : fields;
      return types;
    }, typesMap || {});
}


function handleApacheResponse(err, res, apacheTypes) {
  if (err) {
    throw err;
  }

  if (res.statusCode != 200) {
    throw new Error('Unexpected HTTP statusCode = ' + res.statusCode);
  }

  // Combine mime.types and node.types
  var mapByType = [
    apacheTypes,
    fs.readFileSync(path.join(__dirname, NODE_TYPES), 'ascii')
  ].reduce(parseTypes, {});

  console.log(JSON.stringify(mapByType, null, 2));
}

request.get(APACHE_TYPES, handleApacheResponse);
