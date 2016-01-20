"use strict";

var
    iprange = require('iprange'),
    os = require('os'),
    rand = require('mout/random/choice'),
    append = require('mout/array/append'),
    contains = require('mout/array/contains')
;

/**
 *
 * @param {array} options
 * @constructor
 */
function Ip(options) {
    // режим выбора IP
    this.mode = options.mode || 'random';
	this.iface = options.iface || 'eth0';
	this.family = options.family || 'IPv4';

    // если используется режим одиночного IP, то используем его
    if (this.mode == 'single' && options.hasOwnProperty('ip')) {
        this.nets = [options.ip]
    } else if (options.hasOwnProperty('nets') && contains(['random', 'first'], this.mode)) {
        var nets = []
        options.nets.forEach(function(network) {
            append(nets, (iprange(network)));
        });
        this.nets = nets;
    } else {
        this.nets = [this._local()]
    }
}

/**
 *  Получаем свой IP
 *
 * @private
 * @returns {string|null} IP
 */
Ip.prototype._local = function() {
	let addresses = os.networkInterfaces()[this.iface];

	for (let addr of addresses) {
		if (addr.family != this.family) {
			continue;
		}

		return addr.address.toString();
	}
	return null;
}

/**
 * Выбор IP для запроса
 *
 * @returns {String} IP
 */
Ip.prototype.select = function() {
    switch (this.mode) {
        case "random":
            return rand(this.nets);
        default:
            return this.nets[0]
    }
}

module.exports = Ip;