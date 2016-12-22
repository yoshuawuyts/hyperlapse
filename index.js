var install = require('npm-install-package')
var explain = require('explain-error')
var through = require('through2')
var assert = require('assert')
var split = require('split2')
var pino = require('pino')
var pump = require('pump')
var psy = require('psy')

module.exports = Hyperlapse

// (obj, obj) -> obj
function Hyperlapse (inFeed, outFeed) {
  if (!(this instanceof Hyperlapse)) return new Hyperlapse(inFeed, outFeed)

  assert.equal(typeof inFeed, 'object', 'hyperlapse: inFeed should be an object')
  assert.equal(typeof outFeed, 'object', 'hyperlapse: outFeed should be an object')

  var self = this

  inFeed.open(function (err) {
    if (err) throw err // TODO find a better way to handle this

    var inOpts = {
      live: true,
      start: inFeed.blocks
    }

    self.outStream = outFeed.createWriteStream()
    self.inStream = inFeed.createReadStream(inOpts)
    self.psy = psy()
    self.pino = pino(self.outStream)

    var sink = through(function (data, enc, done) {
      try {
        var json = JSON.parse(data)
      } catch (err) {
        return self._error(err)
      }

      if (json.type === 'start') return self.start(json, end)
      if (json.type === 'stop') return self.stop(json, end)
      if (json.type === 'restart') return self.restart(json, end)
      if (json.type === 'remove') return self.remove(json, end)
      return self._error('hyperlapse: cannot parse command type ' + json.type)

      function end (err) {
        if (err) return self._error(err)
        done()
      }
    })

    pump(self.inStream, split(), sink, function (err) {
      if (err) return self._error(err)
    })
  })
}

Hyperlapse.prototype.start = function (cmd, cb) {
  var self = this

  var command = cmd.command
  var source = cmd.source

  this._log({
    breakpoint: 'install-start',
    source: source
  })

  var installOpts = { cache: true, global: true }
  install(source, installOpts, function (err) {
    if (err) return cb(explain(err, 'hyperlapse.start: error running npm install'))

    self._log({
      breakpoint: 'install-end',
      source: source
    })

    var opts = { name: cmd.name }

    self._log({
      breakpoint: 'run-start',
      source: source,
      command: command,
      opts: opts
    })

    self.psy.start(command, opts, function (err) {
      if (err) return cb(explain(err, 'hyperlapse.start: error starting ' + source))
      self._log({
        breakpoint: 'run-ok',
        source: source
      })
    })
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
  this.pino.error(err)
}

Hyperlapse.prototype._log = function (msg) {
  this.pino.info(msg)
}
