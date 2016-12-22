# hyperlapse [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Distributed process manager. Listens on a [hypercore][hypercore] feed for
[ndjson][ndjson] commands to execute on the host machine using [psy][psy].

## CLI API
```txt
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
```

## JS API
```js
var hyperlapse = require('hyperlapse')
var normcore = require('normcore')

var inFeed = normcore('in-feed')
var outFeed = normcore('out-feed')
hyperlapse(inFeed, outFeed)

outFeed.createReadStream().pipe(process.stdout)
var outKey = outFeed.key.toString('hex')
console.log('outFeed key is ' + outKey)

inFeed.append(JSON.stringify({
  type: 'start',
  name: 'hypercore-archiver-bot',
  source: 'hypercore-archiver-bot@1.1.3',
  command: 'hypercore-archiver-bot --channel=#dat --port=8000'
}) + '\n')
```

## Process commands
Each command should be valid [newline delimited json][ndjson].

### Start
Start a new process on the machine.
```json
{
  "type": "start",
  "name": "what the process should be named on the machine",
  "source": "e.g. my-cool-service-on-npm@3.4.7",
  "command": "/my/cool/service",
  "env": {
    "a bunch": "of env vars"
  }
}
```

### Stop
Stop a process on the machine
```json
{
  "type": "stop",
  "name": "my-cool-process"
}
```

### Restart
Restart a process on the machine
```json
{
  "type": "restart",
  "name": "my-cool-process"
}
```

### Remove
Remove a process on the machine
```json
{
  "type": "remove",
  "name": "my-cool-process"
}
```

### List
List all processes on the machine
```json
{
  "type": "list"
}
```

## API
### hyperlapse(inFeed, outFeed)
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
[ndjson]: http://ndjson.org/
