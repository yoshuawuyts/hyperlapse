var install = require('npm-install-package')
var explain = require('explain-error')
var through = require('through2')
var assert = require('assert')
var split = require('split2')
var pump = require('pump')
var psy = require('psy')

module.exports = Hyperlapse

// (obj, obj) -> obj
function Hyperlapse (inFeed, outFeed) {
  if (!(this instanceof Hyperlapse)) return new Hyperlapse(inFeed, outFeed)

  assert.equal(typeof inFeed, 'object', 'hyperlapse: inFeed should be an object')
  assert.equal(typeof outFeed, 'object', 'hyperlapse: outFeed should be an object')

  var self = this

  this.outStream = outFeed.createWriteStream()
  this.inStream = inFeed.createReadStream()
  this.psy = psy()

  var sink = through(function (data, enc, done) {
    try {
      var json = JSON.parse(data)
    } catch (err) {
      return self._error(err.message)
    }

    if (json.type === 'start') return self.start(json, end)
    if (json.type === 'stop') return self.stop(json, end)
    if (json.type === 'restart') return self.restart(json, end)
    if (json.type === 'remove') return self.remove(json, end)
    return self._error('hyperlapse: cannot parse command type ' + json.type)

    function end (err) {
      if (err && err.info) self._error(err.info)
      else if (err && err.message) self._error(err.message)
      else if (err) self._error(err)
      done()
    }
  })

  pump(self.inStream, split(), sink, function (err) {
    if (err) return self._error(err)
  })
}

Hyperlapse.prototype.start = function (cmd, cb) {
  var self = this

  var command = cmd.command
  var source = cmd.source
  var opts = { name: cmd.name }

  this._log({ type: 'install', source: source })
  install(source, { cache: true }, function (err) {
    if (err) return cb(explain(err, 'hyperlapse.start: error running npm install'))
    self.psy.start(command, opts, cb)
  })
}

Hyperlapse.prototype.stop = function (cmd, cb) {
  var name = cmd.name
  this.psy.stop(name, cb)
}

Hyperlapse.prototype.restart = function (cmd, cb) {
  var name = cmd.name
  this.psy.restart(name, cb)
}

Hyperlapse.prototype.remove = function (cmd, cb) {
  var name = cmd.name
  this.psy.remove(name, cb)
}

Hyperlapse.prototype._error = function (err) {
  err = JSON.stringify({ type: 'error', message: err }) + '\n'
  this.outStream.write(err)
}

Hyperlapse.prototype._log = function (msg) {
  msg = JSON.stringify(msg) + '\n'
  this.outStream.write(msg)
}
