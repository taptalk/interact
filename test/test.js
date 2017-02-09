const should = require('chai').should()
const interact = require('../index')

beforeEach(() => {
})

describe('#compose', () => {
    interact.compose().replace(/\s+/g, ' ').trim().should.equal(`reload = () => { console.log('reloaded') } r = () => reload()`)
})
