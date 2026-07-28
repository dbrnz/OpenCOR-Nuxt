import fs from 'node:fs'
import fsAsync from 'node:fs/promises'
import path from 'node:path'

import { libopencorVersion } from './libopencor.version'

export const libopencorInstallPath = 'libopencor/downloads/wasm'

const versionedBase = `public/${libopencorInstallPath}`

const downloadBaseUrl = 'https://opencor.ws/libopencor/downloads/wasm'
const libopencorFiles = [
    'libopencor.js',
    'libopencor.wasm'
]

const installedVersions = fs.readdirSync(versionedBase, { withFileTypes: true }).filter((e) => e.isDirectory)

for (const entry of installedVersions) {
    if (entry.name !== libopencorVersion) {
        const uninstallPath = `${versionedBase}/${entry.name}`
        console.log(`Removing libopencor from ${uninstallPath}`)

        fs.rmSync(uninstallPath, { recursive: true, force: true })
    }
}

const installPath = `${versionedBase}/${libopencorVersion}`
if (!fs.existsSync(installPath)) {
    await fs.mkdirSync(installPath, { mode: 0o755 })
}

for (const file of libopencorFiles) {
    const installedFile = `${installPath}/${file}`
    if (!fs.existsSync(installedFile)) {
        console.log(`Installing ${file} to ${installPath}`)
        const downloadUrl = `${downloadBaseUrl}/${libopencorVersion}/${file}`
        const response = await fetch(downloadUrl)
        const data = await response.blob()
        const dataStream = data.stream()
        await fsAsync.writeFile(installedFile, dataStream, { mode: 0o644 })
    }
}
