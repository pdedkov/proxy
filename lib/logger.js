var
    morgan = require('morgan'),
    fs = require('fs'),
    fsr = require('file-stream-rotator')

;

/**
 * Обёртка над morgan для логирования в файлы по датам
 * @constructor
 */
function Logger(options) {
    this.format = options.format || 'dev';
    this.freq = options.freq || 'daily';
    this.path = __dirname + (options.path  || '/log/')
    this.name = options.name || 'access.log'
    this.verbose = options.verbose || false

    // создаём если нету
    fs.existsSync(this.path) || fs.mkdirSync(this.path)

    // создаём поток записи
    var stream = fsr.getStream({
        filename: this.path + '%DATE%-'+ this.name,
        frequency: this.freq,
        verbose: this.verbose,
        date_format: "YYYY-MM-DD"
    });

    return morgan(this.format, {stream: stream});
}

module.exports = Logger;