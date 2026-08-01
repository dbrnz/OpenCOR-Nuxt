//==============================================================================

import os from 'node:os'
import path from 'node:path'

//==============================================================================

export const WORKSPACE_ROOT = path.resolve(process.env.WORKSPACE_ROOT || os.homedir())

//==============================================================================

export function resolvePath(filePath: string): string|undefined {
    // If the path has no leading slash or starts with `~/` it is assumed to be
    // relative to WORKSPACE_ROOT
    const fullPath = path.resolve(filePath.startsWith('/')
                                    ? filePath
                                    : filePath.startsWith('~/')
                                    ? `${WORKSPACE_ROOT}/${filePath.slice(2)}`
                                    : `${WORKSPACE_ROOT}/${filePath}`)
    if (fullPath.startsWith(WORKSPACE_ROOT)) {
        return fullPath
    }
}

//==============================================================================
