var
    contains = require('mout/array/contains')
;

function Client(connection) {
	console.log(connection.remoteAddress);
    this.ip = connection.remoteAddress.replace('::ffff:', '');
}

/**
 * Проверяем разрешён ли клиенту доступ по IP
 *
 * @param {Array} список разрешённых IP
 * @returns {Bool} да или нет
 */
Client.prototype.isAllowed = function(list) {
    return contains(list, this.ip);
}

Client.prototype.getIp = function() {
    return this.ip;
}

module.exports = Client;