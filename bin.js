#!/usr/bin/env node

var explain = require('explain-error')
var minimist = require('minimist')
var normcore = require('normcore')
var mkdirp = require('mkdirp')

var hyperlapse = require('./')

var argv = minimist(process.argv.slice(2), {
  boolean: [ 'help', 'version' ],
  alias: {
    h: 'help',
    v: 'version'
  }
})

var usage = `
  Usage:
    $ hyperlapse <command> [options]

  Commands:
    init                            Create a new hypercore in the current dir
    listen <hypercore-public-key>   Listen for commands and print a log key
    start <package-name@version>    Start a service on the host machine
    stop <name>                     Stop a service on the host machine
    remove <name>                   Remove a service on the host machine
    restart <name>                  Restart a service on the host machine
    list                            List all services on the host machine

  Options:
    -h, --help       Print usage
    -v, --version    Print version
    -n, --name       Provide an explicit name when starting a service
    -k, --key        Pass a hypercore directory, assumes cwd if not passed

  Examples:
    $ hyperlapse init
    $ hyperlapse listen <64 bit hypercore public key>
    $ hyperlapse start \
      hypercore-archiver-bot@^1.0.0 -n hypercore-archiver-bot \
      -- hypercore-archiver-bot --channel=#dat --port=8080
    $ hyperlapse list
`

main(argv)

function main (argv) {
  var cmd = argv._.shift()

  if (argv.h) {
    console.info(usage)
    return process.exit()
  }

  if (argv.v) {
    console.info(require('../package.json').version)
    return process.exit()
  }

  if (cmd === 'init') {
    init(argv, function (err) {
      if (err) throw explain(err, 'hyperlapse: error running init')
      process.exit()
    })
  } else if (cmd === 'listen') {
    var key = argv._[0]
    if (!key) {
      console.error('hyperlapse.listen: key should be passed in as an argument')
      process.exit(1)
    }
    listen(key, function (err) {
      if (err) throw explain(err, 'hyperlapse: error running listen')
      process.exit()
    })
  } else if (cmd === 'start') {
  } else if (cmd === 'stop') {
  } else if (cmd === 'remove') {
  } else if (cmd === 'restart') {
  } else if (cmd === 'list') {
  } else {
    console.error(usage)
    return process.exit(1)
  }
}

function init (argv, cb) {
  var loc = argv._[0] || process.cwd()
  mkdirp(loc, function (err) {
    if (err) return cb(err)
    normcore(loc)
    cb()
  })
}

function listen (key, cb) {
  var inFeed = normcore(key)
  var outFeed = normcore('hyperlapse-out-' + key)
  hyperlapse(inFeed, outFeed)
}
