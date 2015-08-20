var
    contains = require('mout/array/contains')
;

function Client(connection) {
    this.ip = connection.remoteAddress;
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

module.exports = Client;