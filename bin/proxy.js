#!/usr/bin/env node

var
    http = require('http'),
    network = require('../lib/ip'),
    net = require('net'),
    url = require('url'),
    fs = require('fs'),
    request = require('request'),
    domain = require('domain').create(),
    morgan = require('morgan'),
    colors = require('colors'),
    argv = require('minimist')(process.argv.slice(2)),
   conf = require('../lib/config')([
       'file://../config/config.json', 'file://../config/local.json'
   ], argv),
    Client = require('../lib/client')
;

// обработчик ошибок
domain.on('error', function(err) {
    console.log(err.stack.toString().red);
})

domain.run(function() {
    // настройка работы с IP
    var ip = new network(conf.getAll())

    // логирование запросов в файл
    logger = morgan('combined', {stream: fs.createWriteStream(__dirname + '/../log/access.log', {flags: 'a'})})
    http.createServer(function(req, res) {
        // проверяем достпуных клиентов
        var client = new Client(req.connection);

        if (!client.isAllowed(conf.get['allowed'])) {
            console.log(req.connection.remoteAddress.cyan);
            return;
        }

        console.log(req.url.yellow);

        logger(req, res, function(err) {
            try {
                var parsed = url.parse(req.url)

                var proxyRequest = http.request({
                    port: parsed.port,
                    hostname: parsed.hostname,
                    method: req.method,
                    path: parsed.path,
                    headers: req.headers,
                    localAddress: ip.select()
                })

                proxyRequest.on('error', function(err) {
                    console.log(err.stack.toString().red);
                    res.statusCode = 500;
                    res.statusMessage = err.toString();

                    res.end();
                });

                proxyRequest.on('response', function(proxyResponse) {
                    proxyResponse.on('data', function(chunk) {
                        res.write(chunk, 'binary')
                    })
                    proxyResponse.on('end', function() {
                        res.end()
                    })
                    res.writeHead(proxyResponse.statusCode, proxyResponse.headers)
                })

                req.on('data', function(chunk) {
                    proxyRequest.write(chunk, 'binary')
                })
                req.on('end', function() {
                    proxyRequest.end()
                })
            } catch (error) {
                console.log(error.toString().cyan);
                res.end();
            }
          })
    }).on('connection', function(socket) {

    }).on('connect', function(req, socketRequest, head) {
        // проверяем достпуных клиентов
        var client = new Client(req);

        if (!client.isAllowed(conf.get['allowed'])) {
            console.log(req.connection.remoteAddress.cyan);
            return;
        }

        console.log(req.url.grey);
        logger(req, socketRequest, function(err) {
            var parsed = url.parse('http://' + req.url);
            var socket = net.connect({
                port: parsed.port,
                host: parsed.hostname,
                localAddress: ip.select()
            }, function() {
                socket.write(head)
                // Сказать клиенту, что соединение установлено
                socketRequest.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n")
            })

            // Туннелирование к хосту
            socket.on('data', function(chunk) {
                socketRequest.write(chunk)
            })
            socket.on('end', function() {
                socketRequest.end()
            })
            socket.on('error', function() {
                // Сказать клиенту, что произошла ошибка
                socketRequest.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n")
                socketRequest.end()
            })
            // Туннелирование к клиенту
            socketRequest.on('data', function(chunk) {
                socket.write(chunk)
            })
            socketRequest.on('end', function() {
                socket.end()
            })
            socketRequest.on('error', function() {
                socket.end()
            })
        })
    }).listen(conf.get('port'));

    console.log(('Proxy started at port: ' + conf.get('port')).toString().green)
})


