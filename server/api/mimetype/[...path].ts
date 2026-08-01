//==============================================================================

import { mimetype } from '#server/utils/mimetype'

//==============================================================================

export default defineEventHandler(async (event) => {
    const filePath = event.context.params?.path
    if (filePath) {
        const type = mimetype(filePath)
        if (type) {
            return {
                path: filePath,
                mimetype: type
            }
        }
        return {
            path: filePath
        }
    }
})

//==============================================================================
