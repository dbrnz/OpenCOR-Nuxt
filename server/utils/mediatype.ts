//==============================================================================

import { Mime } from 'mime/lite'

// @ts-expect-error
import otherTypes from 'mime/types/other'
// @ts-expect-error
import standardTypes from 'mime/types/standard'

const mime = new Mime(standardTypes, otherTypes)

//==============================================================================

type TypeMap = {
    [key: string]: string[];
}

// In our context, `.ts` means Typescript
mime.define({'text/typescript': ['ts']}, true)

// Some modelling specific mediatypes
const extendedTypes: TypeMap[] = [
    {'application/cellml+xml': ['cellml']},
    {'application/zip': ['omex']},
    {'image/svg+xml': ['celldl']}
]

for (const typeMap of extendedTypes) {
    mime.define(typeMap, true)
}

//==============================================================================

export function mediatype(path: string): string|null {
    return mime.getType(path)
}

//==============================================================================
