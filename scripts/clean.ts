#!/usr/bin/env bun

import fs from 'node:fs';

for (const path of [
  '.nuxt',
  'app/components.d.ts',
  'dist',
  'node_modules',
  'public/libopencor'
]) {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
  }
}
