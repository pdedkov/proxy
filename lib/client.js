var
    contains = require('mout/array/contains'),
	iprange = require('iprange'),
	append = require('mout/array/append'),
	contains = require('mout/array/contains')
;

/**
 * Constructor
 * @param {Object} connection current user connection
 * @param {Array} nets list of allowed IPs or networks
 * @constructor
 */
function Client(connection, nets) {
	// get current IP from conection
    this.ip = connection.remoteAddress.replace('::ffff:', '');
	// parse passed allowed networks
	this.allowed = [];

	nets.forEach(function(network) {
		append(this.allowed, (iprange(network)));
	}.bind(this));
}

/**
 * Check is current client allowed
 *
 * @returns {Bool}
 */
Client.prototype.isAllowed = function() {
    return contains(this.allowed, this.ip);
}

/**
 *
 * Get current user IP
 * @returns string
 */
Client.prototype.getIp = function() {
    return this.ip;
}

module.exports = Client;