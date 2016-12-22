#!/usr/bin/env node

var explain = require('explain-error')
var minimist = require('minimist')
var normcore = require('normcore')
var eos = require('end-of-stream')
var crypto = require('crypto')
var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')

var hyperlapse = require('./')

var argv = minimist(process.argv.slice(2), {
  boolean: [ 'help', 'version' ],
  string: [ 'name' ],
  alias: {
    h: 'help',
    v: 'version',
    n: 'name'
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
    init(argv)
  } else if (cmd === 'listen') {
    var key = argv._.shift()
    if (!key) {
      console.error('hyperlapse.listen: key should be passed in as an argument')
      process.exit(1)
    }
    listen(key)
  } else if (cmd === 'start') {
    var source = argv._.shift()
    if (!source) {
      console.error('hyperlapse.start: source should be passed in as the first argument')
      process.exit(1)
    }

    var _cmd = argv._.concat(' ')
    if (!_cmd) {
      console.error('hyperlapse.start: a command should be passed in')
      process.exit(1)
    }

    var name = (argv.name)
      ? argv.name
      : crypto.randomBytes(4).toString('hex')

    start(source, name, _cmd)
  } else if (cmd === 'stop') {
    var stopName = argv.name || argv._.shift()
    if (!stopName) {
      console.error('hyperlapse.remove: a process name should be passed')
      process.exit(1)
    }
    crud('stop', stopName)
  } else if (cmd === 'remove') {
    var removeName = argv.name || argv._.shift()
    if (!removeName) {
      console.error('hyperlapse.remove: a process name should be passed')
      process.exit(1)
    }
    crud('remove', removeName)
  } else if (cmd === 'restart') {
    var restartName = argv.name || argv._.shift()
    if (!restartName) {
      console.error('hyperlapse.restart: a process name should be passed')
      process.exit(1)
    }
    crud('restart', restartName)
  } else if (cmd === 'list') {
  } else {
    console.error(usage)
    return process.exit(1)
  }
}

function init (argv) {
  var loc = argv._[0] || process.cwd()
  mkdirp(loc, function (err) {
    if (err) throw explain(err, 'hyperlapse.init: error creating dir')
    var feed = normcore(loc)
    console.info(feed.key.toString('hex'))
  })
}

function listen (key) {
  var inFeed = normcore(key)
  var outFeed = normcore('hyperlapse-out-' + key)
  hyperlapse(inFeed, outFeed)

  var outKey = outFeed.key.toString('hex')
  console.info(outKey)
}

function start (name, source, command) {
  var msg = JSON.stringify({
    type: 'start',
    name: name,
    source: source,
    command: command
  }) + '\n'

  validateRepo(function (err) {
    if (err) throw explain(err, 'hyperlapse.start: error validating repo')
    var feed = normcore(process.cwd())
    var writeStream = feed.createWriteStream()
    writeStream.end(msg)
    eos(writeStream, function (err) {
      if (err) throw explain(err, 'hyperlapse.start: stream error')
    })
  })
}

function crud (type, name, source) {
  var msg = JSON.stringify({
    type: type,
    name: name,
    source: source
  }) + '\n'

  validateRepo(function (err) {
    if (err) throw explain(err, 'hyperlapse.' + type + ': error validating repo')
    var feed = normcore(process.cwd())
    var writeStream = feed.createWriteStream()
    writeStream.end(msg)
    eos(writeStream, function (err) {
      if (err) throw explain(err, 'hyperlapse.' + type + ': stream error')
    })
  })
}

function validateRepo (done) {
  fs.stat(path.join(process.cwd(), 'SECRET_KEY'), function (err) {
    if (err) return done(new Error('no hypercore with write access found in the current directory - run `hyperlapse init` first'))
    done()
  })
}
