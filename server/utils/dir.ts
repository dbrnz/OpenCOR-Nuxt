//==============================================================================

import fs from 'node:fs'
import type { H3Event } from 'h3'

import { listDirectory } from './fs'

//==============================================================================

export function dirlist(dirPath: string|undefined, event: H3Event) {
    if (dirPath) {
        const fullPath = resolvePath(dirPath)
        if (!fullPath) {
            setResponseStatus(event, 401)
        } else if (fs.existsSync(fullPath)) {
            return listDirectory(fullPath)
        } else {
            setResponseStatus(event, 404)
            return {
                path: fullPath
            }
        }
    } else {
        setResponseStatus(event, 400)
    }
}

//==============================================================================
