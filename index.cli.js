'use strict'

const interact = require('./index.js')

const config = {}

// config.imports = { test: 'fs' }
// config.postloads = [ context => console.log('\r1|5. postload') ]
// config.inits = [ context => console.log('\r2. init') ]
// config.persists = [ { get: context => console.log('\r3. persist get'), set: (context, value) => console.log('\r6. persist set') } ]
// config.preloads = [ context => console.log('\r4. preload') ]
config.historyFile = '.node_repl_history'
config.historyLength = 100
config.capturePromises = true
config.useColors = true

interact.start(config)
