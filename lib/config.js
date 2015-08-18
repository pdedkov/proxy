var qconf = require('qconf');

module.exports = function(path, override) {
    override = override || {}
    var conf = qconf(override, path);

    return conf;
}