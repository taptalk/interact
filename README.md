<img src="icon.png" alt="Interact Icon" width="72"/>


Interact
======

*Interactive node console, extended.*

With interact you can customize your interactive node console with functionality like auto-import, reload, promises.

## Installation

    npm install @leonardvandriel/interact --save-dev

Add console script to `package.json`:

    "scripts": {
      "console": "node interact.js"
    },

And for convenience, alias `npm run-script console` (add this to ~/.bashrc):

	alias console="npm run-script console"

Create a configuration file `interact.js`:

    const interact = require('@leonardvandriel/interact')
    const config = {}
    interact.start(config)


## Usage

Start the console:

    console

Or if you did not alias:

    npm run-script console


## Configuration

All configuration is passed upon invoking `interact.start(..)` from `interact.js`. See example [interact.js](interact.js).


### Importing modules

To import (require) modules, add `imports` to the configuration:

    config.imports = { fs: 'fs' }

Start the console. Now `fs` is available:

    > fs.readFileSync('LICENSE', 'utf8')


### Configure REPL directly

Internally we use Node's [REPL](https://nodejs.org/api/repl.html) module. The configuration is passed on to `repl.start(..)`. For example, to prevent outputting `undefined` as return value of a command, add:

    config.ignoreUndefined = true


### More config

A more fancy `interact.js` setup file:

    const interact = require('@leonardvandriel/interact')
    const config = {}
    config.imports = { fs: 'fs' }
    config.capturePromises = true
    config.useColors = true
    config.historyFile = '.node_repl_history'
    interact.start(config)

More config options can be found in [interact.js](https://github.com/taptalk/interact/blob/master/interact.js).

## Tests

    npm test


## License

Interact is licensed under the terms of the BSD 3-Clause License, see the included LICENSE file.


## Authors

- Leo Vandriel
