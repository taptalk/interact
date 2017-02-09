const should = require('chai').should()
const interact = require('../index')

beforeEach(() => {
})

describe('#compose', () => {
    interact.compose().replace(/\s+/g, ' ').trim().should.equal(`reload = () => { console.log('reloaded') } r = () => reload()`)
})

describe('#generate', () => {
    const l = console.log
    let buffer
    console.log = b => buffer = b
    interact.generate()
    should.exist(buffer)
    console.log = l
})
