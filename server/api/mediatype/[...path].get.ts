//==============================================================================

import { mediatype } from '~~/server/utils/mediatype'

//==============================================================================

export default defineEventHandler(async (event) => {
    const filePath = event.context.params?.path
    if (filePath) {
        const type = mediatype(filePath)
        if (type) {
            return {
                path: filePath,
                mediatype: type
            }
        }
        return {
            path: filePath
        }
    }
})

//==============================================================================
