var
    myIp = require('node-localip'),
    iprange = require('iprange'),
    os = require('os'),
    rand = require('mout/random/choice'),
    append = require('mout/array/append'),
    contains = require('mout/array/contains')
;

/**
 *
 * @param algo
 * @constructor
 */
function Ip(options) {
    // режим выбора IP
    this.mode = options.mode || 'random'

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
 * @returns {string} IP
 */
Ip.prototype._local = function() {
    return os.networkInterfaces().eth0[0].address
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