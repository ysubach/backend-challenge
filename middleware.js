'use strict';

var http = require('http');
var url = require('url');

function App() {
  this.server = http.createServer(this._onRequest.bind(this));
  this.handlers = [];
}

App.prototype.use = function(pathOrFunc, func) {
  if (typeof(pathOrFunc) == 'function') {
    console.log('adding / + function');
    this.handlers.push({ path:null, callback:pathOrFunc });
  } else {
    console.log('adding path + function');
    this.handlers.push({ path:pathOrFunc, callback:func});
  }
}

App.prototype.listen = function(port, callback) {
  this.server.listen(port, 'localhost', 511, callback);
}

App.prototype._onRequest = function(request, response) {
  var _this = this;
  var reqPath = url.parse(request.url).path;
  console.log('got request: ' + reqPath);

  var finished = false;
  request.on('close', function() { finished = true });

  var process = function(startIndex) {
    if (finished) {
      return;
    }
    for (var i = startIndex, l = _this.handlers.length; i < l; i ++) {
      var handler = _this.handlers[i];
      if (handler.path == null || handler.path == reqPath) {
        handler.callback(request, response, function() { process(i+1); })
        return;
      }
    }
  };
  process(0);
}

function createServer() {
  return new App();
}

exports.createServer = createServer;
