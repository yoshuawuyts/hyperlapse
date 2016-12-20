var hyperlapse = require('./')
var normcore = require('normcore')

// the command feed usually lives remotely
var commandFeed = normcore('command-feed')
var commandKey = commandFeed.key.toString('hex')

var inFeed = normcore(commandKey)
var outFeed = normcore('out-feed')
hyperlapse(inFeed, outFeed)

outFeed.createReadStream().pipe(process.stdout)
var outKey = outFeed.key.toString('hex')
console.info(outKey)

commandFeed.append(JSON.stringify({
  type: 'start',
  name: 'hypercore-archiver-bot',
  source: 'hypercore-archiver-bot@1.1.3',
  command: 'hypercore-archiver-bot --channel=#dat --port=8000'
}) + '\n')
