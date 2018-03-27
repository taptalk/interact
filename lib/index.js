'use strict'

const fs = require('fs')
const repl = require('repl')
const util = require('util')

const defaultPrompt = '> '
const defaultHistoryFile = '.node_repl_history'
const defaultGray = 90
const defaultPrefix = '../'.repeat(4)

module.exports = new class {

    // printing

    string(object, colors) {
        return util.inspect(object, { colors })
    }

    color(line, color, current) {
        return `\x1b[${color || 0}m${line}\x1b[${current || 0}m`
    }

    put(line, color) {
        return color ? this.put(this.color(line, color)) : process.stdout.write(line)
    }

    print(line, color, prompt) {
        return color ? this.print(this.color(line, color), 0, prompt) : this.put(`\r${line}\n${prompt || defaultPrompt}`)
    }

    silence(operation) {
        const log = process.stdout.write
        process.stdout.write = (_ => _)
        const result = operation()
        process.stdout.write = log
        return result
    }

    // utilities

    list(path, suffixes, regex) {
        let list = fs.readdirSync(path)
        if (suffixes) {
            suffixes = (Array.isArray(suffixes) ? suffixes : [suffixes]).sort((a, b) => b.length - a.length)
            list = list.map(f => {
                for (let i in suffixes) {
                    const suffix = suffixes[i]
                    if (f.endsWith(suffix)) {
                        return f.substring(0, f.length - suffix.length)
                    }
                }
            }).filter(f => f)
        }
        if (regex) {
            list = list.filter(f => f.match(regex))
        }
        return list
    }

    // initialization

    pathForRequire(path, prefix) {
        if (path && path.startsWith('.')) {
            path = (prefix !== undefined ? prefix : defaultPrefix) + path
        }
        return path
    }

    loadConfig(context, config, reload) {
        const temp = {}
        let promise = Promise.resolve()
        if (config.preLoad) {
            promise = promise.then(_ => config.preLoad(context, temp))
        }
        if (reload) {
            promise = promise.then(_ => {
                for (let key in config.module) {
                    let path = this.pathForRequire(config.module[key], config.requirePrefix)
                    delete require.cache[require.resolve(path)]
                }
            })
        }
        for (let key in config.module) {
            promise = promise.then(_ => {
                let path = this.pathForRequire(config.module[key], config.requirePrefix)
                let r = require(path)
                context[key] = r.default || r
            })
        }
        if (config.postLoad) {
            promise = promise.then(_ => config.postLoad(context, temp))
        }
        if (!reload) {
            if (config.postInit) {
                promise = promise.then(_ => config.postInit(context))
            }
        }
        return promise.catch(e => console.error(e) || process.exit())
    }

    capturePromise(output, writer, context, config) {
        const promise = (output && typeof output.then === 'function')
        if (!promise) {
            context._ = output
            return writer(output)
        }
        let finished = false
        let index = 0
        const p = (_ => {
            index = (this.promiseIndex = (this.promiseIndex || 0) + 1)
            return this.color(`=> [${index}]`, defaultGray)
        })
        const w = (o => {
            finished = true
            return index ? this.color(`[${index}]: `, defaultGray) + writer(o) : writer(o)
        })
        output
            .then(result => context._ = result)
            .then(result => this.print(w(result), 0, config.prompt))
            .catch(error => this.print(w(error), config.useColor ? 91 : 0, config.prompt))
        if (config.waitPromise > 0) {
            setTimeout(_ => finished || this.print(p(), 0, config.prompt), config.waitPromise)
            return "\x1b[F"
        } else {
            return p()
        }
    }

    prepareConfig(config) {
        const container = {}
        if (config.capturePromise) {
            const writer = config.writer || (output => this.string(output, config.useColor))
            config.writer = output => this.capturePromise(output, writer, container.context, config)
        }
        return container
    }

    loadHistory(server, path, maxLength) {
        const data = fs.readFileSync(path, 'utf8')
        let last = null
        let lines = data.split('\n').reverse().filter(l => l.trim() && l !== last && (last = l))
        if (maxLength && lines.length > maxLength) {
            lines = lines.slice(0, maxLength)
            const data = lines.join('\n')
            fs.writeFileSync(path, data)
        }
        lines.forEach(l => server.history.push(l))
    }

    saveHistory(server, path, maxLength) {
        let last = null
        let lines = server.lines.filter(l => l.trim() && l !== last && (last = l))
        const data = lines.join('\n') + '\n'
        fs.appendFileSync(path, data)
    }

    prepareContext(container, config, server) {
        if (config.capturePromise) {
            this.silence(_ => server.context._ = undefined)
            container.context = server.context
        }
    }

    registerCommand(server, config) {
        const historyFile = config.historyFile || defaultHistoryFile
        if (fs.existsSync(historyFile)) {
            this.loadHistory(server, historyFile, config.historyLength)
        }

        const exit = () => {
            if (config.historyLength > 0) {
                this.saveHistory(server, historyFile, config.historyLength)
            }
            process.exit()
        }
        server.on('exit', exit)
        server.defineCommand('e', {
            help: 'Alias for .exit',
            action: exit,
        })

        const reload = () => {
            this.put('\rloading..', defaultGray)
            return Promise.resolve()
            .then(_ => this.loadConfig(server.context, config, true))
            .then(_ => this.print('reloaded ', defaultGray, config.prompt))
        }
        server.defineCommand('reload', {
            help: 'Reload sources',
            action: reload,
        })
        server.defineCommand('r', {
            help: 'Alias for .reload',
            action: reload,
        })

        const history = () => {
            const lines = server.history.slice(1).reverse()
            this.print(lines.join('\n'), defaultGray, config.prompt)
        }
        server.defineCommand('history', {
            help: 'List previous input',
            action: history,
        })

        const modules = () => {
            const text = util.inspect(config.modules || {})
            this.print(text || {}, defaultGray, config.prompt)
        }
        server.defineCommand('modules', {
            help: 'List imported modules',
            action: modules,
        })

        const conf = () => {
            const text = util.inspect(config || {})
            this.print(text || {}, defaultGray, config.prompt)
        }
        server.defineCommand('config', {
            help: 'List full configuration',
            action: conf,
        })
    }

    setup(config) {
        const container = this.prepareConfig(config)
        const server = repl.start(config)

        this.prepareContext(container, config, server)
        this.registerCommand(server, config)

        this.put('loading..\r', defaultGray)
        return Promise.resolve()
        .then(_ => this.loadConfig(server.context, config, false))
        .then(_ => this.put(`         \r${config.prompt || defaultPrompt}`))
        .then(_ => server)
    }

    start(config) {
        return this.setup(config || {})
    }
}
