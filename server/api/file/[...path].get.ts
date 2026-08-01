//==============================================================================

import fs from 'node:fs'

//==============================================================================

import { resolvePath } from '#server/utils/environment'
import { mimetype } from '#server/utils/mimetype'

//==============================================================================

export default defineEventHandler(async (event) => {
    const filePath = event.context.params?.path
    if (filePath) {
        const fullPath = resolvePath(filePath)
        if (!fullPath) {
            setResponseStatus(event, 401)
        } else if (fs.existsSync(fullPath)) {
            const fileStream = fs.createReadStream(fullPath)
            const contentType = mimetype(fullPath)
            if (contentType) {
                setResponseHeader(event, 'Content-Type', contentType)
            }
            return sendStream(event, fileStream)
        } else {
            setResponseStatus(event, 404)
            return {
                path: fullPath
            }
        }
    } else {
        setResponseStatus(event, 400)
    }
})

//==============================================================================
