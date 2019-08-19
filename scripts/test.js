process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'
process.env.PUBLIC_URL = ''

// polyfills
global.window = global;
window.addEventListener = () => {};
window.requestAnimationFrame = () => {
  throw new Error('requestAnimationFrame is not supported in Node');
};

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => { throw err })

const jest = require('jest')
const argv = process.argv.slice(2)

jest.run(
  argv
  .filter(arg => arg !== '--inspect-brk')
  .concat([ '--runInBand', '--env=jsdom' ])
)
