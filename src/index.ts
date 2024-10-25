import type { OutputChunk, Plugin } from 'rollup'

interface UmdOptions {
  banner?: string
}

function rewriteUmdPlugin(options?: UmdOptions): Plugin {
  const {
    banner,
  } = options || {}

  return {
    name: 'rewrite-umd',
    generateBundle(_ctx, options) {
      if (_ctx.format !== 'umd')
        return
      const data = Object.values(options)[0] as OutputChunk
      const { code, exports, imports } = data

      let rootName = ''

      // (function(e,t){...})(this,function(
      const defineReg
        = /\(function\((?<root>\w+),(?<factory>\w+)\)\{(?<rest>.*?)\}\)\(this,function/s

      const rewritten = code
        .replace(defineReg, (...args) => {
          const { root, factory } = args.at(-1)
          rootName = root
          return `${banner || ''}
!(function(${root},${factory}){
  const returns = ${factory}(module, ${imports.map(i => `require("${i}")`).join(', ')});
  if (typeof exports == "object" && typeof module < "u") {
    module.exports = returns;
    ${exports.map(exp => `exports.${exp} = returns.${exp};`).join('\n')}
  }
  else if (typeof define == "function" && define.amd) {
    define(["exports", ${imports.map(i => `"${i}"`).join(', ')}, ${factory}]);
  }
  else {
    ${exports.map(exp => `${root}.${exp} = returns.${exp};`).join('\n')}
  }
})(this,function`
        })
        .replace(new RegExp(`[,;](${rootName}.\\w+=\\$?\\w+,)+`), (args) => {
          const returns = args
            .slice(1, -1)
            .replaceAll(`${rootName}.`, '')
            .replaceAll('=', ':')
          return `;return {${returns}};`
        })
        .replace(/typeof (?<name>\w)=="object"&&"default"in/g, (...args) => {
          const { name } = args.at(-1)
          return `(typeof ${name}=="function"||typeof ${name}=="object")&&"default"in`
        })

      data.code = rewritten
    },
  }
}

export default rewriteUmdPlugin

export { rewriteUmdPlugin, UmdOptions }
