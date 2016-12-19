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

    if (json.type === 'start') return self._start(json, end)
    if (json.type === 'stop') return self._stop(json, end)
    if (json.type === 'restart') return self._restart(json, end)
    if (json.type === 'remove') return self._remove(json, end)
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

Hyperlapse.prototype._start = function (cmd, cb) {
  var command = cmd.command
  var opts = { name: cmd.name }
  this.psy.start(command, opts, cb)
}

Hyperlapse.prototype._stop = function (cmd, cb) {
  var name = cmd.name
  this.psy.stop(name, cb)
}

Hyperlapse.prototype._restart = function (cmd, cb) {
  var name = cmd.name
  this.psy.restart(name, cb)
}

Hyperlapse.prototype._remove = function (cmd, cb) {
  var name = cmd.name
  this.psy.remove(name, cb)
}

Hyperlapse.prototype._error = function (err) {
  err = JSON.stringify({ type: 'error', message: err }) + '\n'
  this.outStream.write(err)
}
