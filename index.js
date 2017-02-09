'use strict'

module.exports = new class {
    constructor() {
        this.require = {}
        this.runs = []
        this.persists = []
    }

    import(pairs) {
        for (let key in pairs) {
            const value = pairs[key]
            this.require[key] = value
        }
    }

    run(func) {
        this.runs.push(this.stringfy(func))
    }

    persist(func) {
        this.persists.push(this.stringfy(func))
    }

    compose() {
        let buffer = ''
        for (let key in this.require) {
            let path = this.require[key]
            buffer += this.stringfy(_ => _C1_ = require('_C2_'), key, path) + '\n'
        }
        let b = ''
        for (let i in this.persists) {
            b += this.stringfy(_ => { const _C1_ = _C2_ }, `p${i}`, this.persists[i]) + '\n'
        }
        for (let key in this.require) {
            b += this.stringfy(_ => delete require.cache[require.resolve('_C_')], this.require[key]) + '\n'
        }
        for (let key in this.require) {
            b += this.stringfy(_ => _C1_ = require('_C2_'), key, this.require[key]) + '\n'
        }
        for (let i in this.persists) {
            b += this.stringfy(_ => _C1_ = _C2_, this.persists[i], `p${i}`) + '\n'
        }
        buffer += this.stringfy(_ => reload = () => {
            _C_
            console.log('reloaded')
        }, b) + '\n'
        buffer += this.stringfy(_ => r = () => reload()) + '\n'
        if (this.runs.length > 0) {
            buffer += this.tryBuffer(this.runs.join('\n'))
        }
        return buffer
    }

    generate() {
        const buffer = this.compose()
        // console.error(buffer)
        console.log(buffer)
    }

    stringfy(func, c1, c2) {
        let buffer = func.toString().match(/^\(?[a-z_, ]*\)?\s*=>\s*([\s\S]*)$/)[1]
        if (buffer.startsWith('{') && buffer.endsWith('}')) {
            buffer = buffer.substring(1, buffer.length - 1).trim()
        }
        buffer = buffer.replace('_C_', c1)
        buffer = buffer.replace('_C1_', c1)
        buffer = buffer.replace('_C2_', c2)
        return buffer
    }

    tryBuffer(buffer) {
        return this.stringfy(() => {
            try {
                _C_
            } catch(e) {
                console.log(e)
                process.exit(0)
            }
        }, buffer)
    }
}
