'use strict'

const fs = require('fs')
const repl = require('repl')
const util = require('util')

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
        return color ? this.print(this.color(line, color), 0, prompt) : this.put(`\r${line}\n${prompt || '> '}`)
    }

    // initialization

    pathForRequire(path, prefix) {
        if (path && path.startsWith('.')) {
            path = (prefix !== undefined ? prefix : '../../../') + path
        }
        return path
    }

    loadConfig(context, config, reload) {
        const mem = []
        if (reload) {
            for (let i in config.persists) {
                try {
                    mem[i] = config.persists[i].get(context)
                } catch (e) { console.log(e) }
            }
            for (let i in config.preloads) {
                try {
                    config.preloads[i](context)
                } catch (e) { console.log(e) }
            }
            for (let key in config.imports) {
                let path = this.pathForRequire(config.imports[key], config.requirePrefix)
                delete require.cache[require.resolve(path)]
            }
        }
        for (let key in config.imports) {
            try {
                let path = this.pathForRequire(config.imports[key], config.requirePrefix)
                let r = require(path)
                context[key] = r.default || r
            } catch (e) { console.log(e) || reload || process.exit() }
        }
        for (let i in config.postloads) {
            try {
                config.postloads[i](context)
            } catch (e) { console.log(e) || reload || process.exit() }
        }
        if (reload) {
            for (let i in config.persists) {
                try {
                    config.persists[i].set(context, mem[i])
                } catch (e) { console.log(e) }
            }
        } else {
            for (let i in config.inits) {
                try {
                    config.inits[i](context)
                } catch (e) { console.log(e) || process.exit() }
            }
        }
    }

    capturePromise(output, prompt, writer, useColors) {
        const promise = output && typeof output.then === 'function'
        if (promise) {
            output
                .then(result => this.print(writer(result), 0, prompt))
                .catch(error => this.print(writer(error), useColors ? 91 : 0, prompt))
            return this.color('promised', 90)
        } else {
            return writer(output)
        }
    }

    prepareConfig(config) {
        if (config.capturePromises) {
            const writer = config.writer || (output => this.string(output, config.useColors))
            config.writer = output => this.capturePromise(output, config.prompt, writer, config.useColors)
        }
        return config
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

    registerCommand(server, config) {
        if (config.historyFile && fs.existsSync(config.historyFile)) {
            this.loadHistory(server, config.historyFile, config.historyLength)
        }

        const exit = () => {
            if (config.historyFile) {
                this.saveHistory(server, config.historyFile, config.historyLength)
            }
            process.exit()
        }
        server.on('exit', exit)
        server.defineCommand('e', {
            help: 'Alias for .exit',
            action: exit,
        })

        const reload = () => {
            this.put('\rloading..', 90)
            this.loadConfig(server.context, config, true)
            this.print('reloaded ', 90, config.prompt)
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
            this.print(lines.join('\n'), 90, config.prompt)
        }
        server.defineCommand('history', {
            help: 'List previous input',
            action: history,
        })

        const imports = () => {
            const text = util.inspect(config.imports || {})
            this.print(text || {}, 90, config.prompt)
        }
        server.defineCommand('imports', {
            help: 'List imports',
            action: imports,
        })

        const conf = () => {
            const text = util.inspect(config || {})
            this.print(text || {}, 90, config.prompt)
        }
        server.defineCommand('config', {
            help: 'List full configuration',
            action: conf,
        })
    }

    setup(config) {
        this.prepareConfig(config)
        const server = repl.start(config)
        this.registerCommand(server, config)

        this.put('\rloading..', 90)
        this.loadConfig(server.context, config, false)

        this.print('try `.help`', 90, config.prompt)

        return server
    }

    start(config) {
        this.setup(config || {})
    }
}
