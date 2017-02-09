const should = require('chai').should()
const interact = require('../index')

beforeEach(() => {
    interact.clear()
})

describe('#preload', () => {
    it('works', () => {
        interact.preload(_ => x)
        interact.compose().replace(/\s+/g, ' ').trim().should.equal(`reload = () => { x console.log('reloaded') } r = () => reload()`)
    })
})

describe('#compose', () => {
    it('works', () => {
        interact.compose().replace(/\s+/g, ' ').trim().should.equal(`reload = () => { console.log('reloaded') } r = () => reload()`)
    })
})

describe('#generate', () => {
    it('works', () => {
        const l = console.log
        let buffer
        console.log = b => buffer = b
        interact.generate()
        should.exist(buffer)
        console.log = l
    })
})
