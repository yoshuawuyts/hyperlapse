var test = require('tape')
var hyperlapse = require('./')

test('should assert input types', function (t) {
  t.plan(1)
  t.throws(hyperlapse)
})
