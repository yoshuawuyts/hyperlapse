# hyperlapse [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Distributed process manager. Listens on a [hypercore][hypercore] feed for JSON
commands to execute on the host machine using [psy][psy].

## CLI API
```txt
  Usage:
    $ hyperlapse <command> [options]

  Commands:
    listen <hypercore key>             Listen for commands and print a log key
    append <hypercore key> <command>   Append commands onto a feed
    list   <hypercore key>             Print the services on a machine

  Process commands:
    start <package-name@version>   Boot up a service on the host machine
    stop
    remove
    restart

  Options:
    -h, --help              Print usage
    -v, --version           Print version
```

## JS API
```js
var hyperlapse = require('hyperlapse')
var normcore = require('normcore')

// the command feed usually lives remotely
var commandFeed = normcore('command-feed')
var commandKey = commandFeed.key.toString('hex')

var inFeed = normcore(commandKey)
var outFeed = normcore('out-feed')
hyperlapse(inFeed, outFeed)

outFeed.createReadStream().pipe(process.stdout)
var outKey = outFeed.key.toString('hex')
console.log('outFeed key is ' + outKey)

commandFeed.append(JSON.stringify({
  type: 'start',
  name: 'hypercore-archiver-bot',
  source: 'hypercore-archiver-bot@1.1.3',
  command: 'hypercore-archiver-bot --channel=#dat --port=8000'
}) + '\n')
```

## Process commands
### Start
Start a new process on the machine.
```json
{
  "type": "start",
  "name": "what the process should be named on the machine",
  "source": "e.g. my-cool-service-on-npm@3.4.7",
  "env": {
    "a bunch": "of env vars"
  }
}
```

### Stop
Stop a process on the machine
```json
{
  type: "stop",
  "name": "my-cool-process"
}
```

### Restart
Restart a process on the machine
```json
{
  type: "restart",
  "name": "my-cool-process"
}
```

### Remove
Remove a process on the machine
```json
{
  type: "remove",
  "name": "my-cool-process"
}
```

## API
### agent = hyperlapse(inFeed, outFeed)
Create a new agent that tails a `hypercore`. Reads commands from the `inFeed`
and logs its output to the `outFeed`.

## Installation
```sh
$ npm install hyperlapse
```

## See Also
- [mafintosh/hypercore][hypercore]
- [substack/psy][psy]

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/hyperlapse.svg?style=flat-square
[3]: https://npmjs.org/package/hyperlapse
[4]: https://img.shields.io/travis/yoshuawuyts/hyperlapse/master.svg?style=flat-square
[5]: https://travis-ci.org/yoshuawuyts/hyperlapse
[6]: https://img.shields.io/codecov/c/github/yoshuawuyts/hyperlapse/master.svg?style=flat-square
[7]: https://codecov.io/github/yoshuawuyts/hyperlapse
[8]: http://img.shields.io/npm/dm/hyperlapse.svg?style=flat-square
[9]: https://npmjs.org/package/hyperlapse
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard

[hypercore]: https://github.com/mafintosh/hypercore
[psy]: https://github.com/substack/psy
