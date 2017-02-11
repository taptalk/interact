const expect = require('chai').expect
const interact = require('../index')

beforeEach(() => {
})

describe('#string', () => {
    it('works', () => {
        expect(interact.string({})).to.equal('{}')
        expect(interact.string({}, false)).to.equal('{}')
        expect(interact.string({}, true)).to.equal('{}')
    })
})

describe('#color', () => {
    it('works', () => {
        expect(interact.color('s')).to.equal('\u001b[0ms\u001b[0m')
        expect(interact.color('s', 0)).to.equal('\u001b[0ms\u001b[0m')
        expect(interact.color('s', 90)).to.equal('\u001b[90ms\u001b[0m')
    })
})

describe('#loadConfig', () => {
    it('works without reload', () => {
        let i = 0
        let postload = 0
        let init = 0
        interact.loadConfig({}, {
            postloads: [context => postload = (i += 1)],
            inits: [context => init = (i += 1)],
        }, false)
        expect(postload).to.equal(1)
        expect(init).to.equal(2)
    })

    it('works with reload', () => {
        let i = 0
        let postload = 0
        let preload = 0
        let init = 0
        interact.loadConfig({}, {
            postloads: [context => postload = (i += 1)],
            preloads: [context => preload = (i += 1)],
            inits: [context => init = (i += 1)],
        }, true)
        expect(init).to.equal(0)
        expect(preload).to.equal(1)
        expect(postload).to.equal(2)
    })
})
