<img src="icon.png" alt="Interact Icon" width="72"/>


Interact
======

*Interactive node console, extended.*

An interactive node console with auto-import, source reload, support for promises.


## Installation

    npm install @leonardvandriel/interact --save-dev

Create a configuration file `console` in the project root:

    const interact = require('@leonardvandriel/interact')
    interact.start()


## Getting started

Start the console:

    node console

Now run any node code:

    > 1 + 1

Te result can be referred to with `_`:

    > _ + 1

After making changes to the source, we can reload without restarting the console:

    > .reload

NB: this reloads the sources referenced in module, but does *not* reload the configuration in the `console` file.

To get more details on the current configuration:

    > .config

And for more in-console help:

    > .help

All configuration is passed upon invoking `interact.start(..)` from `console` file:

    const config = {}
    config.useColor = true
    interact.start(config)

More config options can be found in the example [console](https://github.com/taptalk/interact/blob/master/console) file. Internally we use Node's [REPL](https://nodejs.org/api/repl.html) module.


## Import and reload

To import (require) modules, add `module` to the configuration:

    const config = { module: {} }
    config.module.fs = 'fs'
    config.module.myclass = './lib/myclass'

After restarting (not reloading) the console, `fs` is available:

    > fs.readFileSync('LICENSE', 'utf8')
    > myclass.run()

When making changes to imported modules, a restart is not necessary. Instead we can reload the module:

    > .reload
    > .r

Perhaps there is additional informat that we want to make accessible in the REPL. This can be done by adding `init` to our configuration:

    config.postInit = (context) => { context.myvar = 3 }

This variable is now accessible in the REPL:

    > myvar
    3

Reloading will delete the import cache and re-import the modules. Some modules contain state that will be lost after reloading. To persist module state, we can temporarily save it during the reloading:

    config.preLoad = (context, temp) => { temp.database = context.myclass.database }
    config.postLoad = (context, temp) => { context.myclass.database = temp.database }


## Promises

When evaluation results in a promise, this promise object is echoed instead of the result. We can capture all promises instead and await them:

    config.capturePromise = true

This will assign an index to every promise and so it can be linked to the result later on:

    > new Promise(r => setTimeout(r, 5000)).then(_ => 1234)
    => [1]

And 5 seconds later:

    [1]: 1234

Often promises return almost immediately, which makes indexing unnecessary. To wait for 0.5 seconds, add to the configuration:

    config.waitPromise = 500

Now simple promises are seamlessly evaluated:

    > Promise.resolve(1234)
    1234


## History

The REPL history can be accessed with the up/down arrows. To persist this history across console runs, add to the configration:

    config.historyLength = 100

This will store and reload history from the file `.node_repl_history`.

Make sure to add this path to `.gitignore`. History can also be store somewhere more centrally by changing the path:

    config.historyFile = '/home/me/.node_repl_history'


## Tests

    npm test


## License

Interact is licensed under the terms of the BSD 3-Clause License, see the included LICENSE file.


## Authors

- Leo Vandriel
