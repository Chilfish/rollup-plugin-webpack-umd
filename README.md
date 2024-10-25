## Rollup plugin webpack-like UMD rewrite

A Rollup plugin that modifies UMD output to ensure compatibility with named exports and correct factory return statements, particularly helpful for Vite projects that built UMD libraries.

### Features

- **UMD Module Rewriting**: Adds missing named exports and return values in UMD output for better compatibility.
- **Vite CommonJS Adaptation**: Ensures that named exports are visible when using `vite-plugin-commonjs`.
- **Auto-inject Exports**: Automatically injects named exports into the UMD factory.

### Usage

Install and add the plugin to your Rollup configuration:

```ts
import rewriteUmdPlugin from 'rollup-webpack-umd'

export default {
  plugins: [
    rewriteUmdPlugin({ banner: '/* Custom UMD Rewrite */' })
  ],
  // other config options
}
```

or `vite.config.js`

```js
import rewriteUmdPlugin from 'rollup-webpack-umd'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        rewriteUmdPlugin({ banner: '/* Custom UMD Rewrite */' })
      ]
    }
  }
})
```

### Options

The plugin supports the following options:

- `banner`: A comment string to prepend to the UMD output (default: `''`).

### Why

Vite’s default UMD output structure lacks the handling of certain named exports, causing issues when trying to `import` named functions or objects from UMD-built libraries.

```js
(function (global, factory) {
  // basically same as webpack UMD output, but missing this line
  // else if (typeof exports === 'object') {
  //   exports.functionName = factory()
  // }
})(this, (exports2) => {
  'use strict'
  Object.defineProperty(exports2, Symbol.toStringTag, { value: 'Module' })
  // and there is no return statement at the end like this
  // return { functionName }
})
```

This plugin addresses this gap by rewriting the UMD output so that named exports are accessible and correctly returned, simplifying integration with various import styles (ESM, CommonJS, etc.).

### How it Works

The plugin leverages Rollup's `generateBundle` hook to:

1. **Identify the UMD Output**: It checks if the output format is UMD before rewriting.
2. **Regex-Based Transformation**: Applies regex transformations to modify the UMD wrapper, ensuring:
   - Named exports are assigned to the `exports` object.
   - All exports are accessible through a final return statement in the UMD factory.
3. **Adaptation for Vite**: Adjusts CommonJS compatibility by injecting named exports directly into the module exports, preventing import errors.

### License

MIT License
