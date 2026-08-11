import Bun from 'bun'
import { renameSync, rmSync } from 'node:fs'

const buildOptions = {
  entrypoints: ['.output/server/index.mjs'],
  minify: true
}

const targets = [
  'bun-darwin-arm64',
  'bun-linux-arm64',
  'bun-linux-x64',
  'bun-windows-arm64',
  'bun-windows-x64'
//  'bun-windows-x64-baseline',  // This is for pre-Haswell (2013) CPUs
]

// Remove any existing built distributions
rmSync('./dist', { recursive: true, force: true })

for (const target of targets) {
  const ext = target.includes('windows') ? '.exe' : ''
  const compileOptions = {
    outdir: './dist',
    target: target
  }

  await Bun.build({ ...buildOptions, ...compileOptions })

  // Bun has issues with `outfile`, e.g. https://github.com/oven-sh/bun/pull/30884
  // so we simply rename the generated executable
  renameSync(`./dist/server${ext}`, `./dist/ModelExplorer_${target.slice(4)}${ext}`)
}
