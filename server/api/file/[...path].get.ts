//==============================================================================

import fs from 'node:fs'

//==============================================================================

import { resolvePath } from '#server/utils/environment'
import { mediatype } from '#server/utils/mediatype'

//==============================================================================

export default defineEventHandler(async (event) => {
    const filePath = event.context.params?.path
    if (filePath) {
        const fullPath = resolvePath(filePath)
        if (!fullPath) {
            setResponseStatus(event, 401)
        } else if (fs.existsSync(fullPath)) {
            const fileStream = fs.createReadStream(fullPath)
            const contentType = mediatype(fullPath)
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
