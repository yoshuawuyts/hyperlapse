var hypercore = require('hypercore')
var through = require('through2')
var assert = require('assert')
var split = require('split2')
var pump = require('pump')

module.exports = hyperlapse

// Distributed process manager
// (obj, str) -> obj
function hyperlapse (db, key) {
  assert.equal(typeof db, 'object', 'hyperlapse: db should be an object')
  assert.equal(typeof key, 'string', 'hyperlapse: key should be a string')

  var core = hypercore(db)
  var feed = core.createFeed(key)

  var sink = through(function (data, enc, done) {
  })

  pump(feed.createReadStream(), split(), sink, function (err) {
    if (err) throw err // TODO append to return stream
  })
}
