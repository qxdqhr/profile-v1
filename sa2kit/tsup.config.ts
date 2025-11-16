import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'three'],
  treeshake: true,
  minify: false,
  // minify: 'terser',
  // terserOptions: {
  //   compress: {
  //     drop_console: true,
  //   },
  // },
})

