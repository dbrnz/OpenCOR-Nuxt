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

// Some modelling specific mimetypes
const extendedTypes: TypeMap[] = [
    {'application/cellml+xml': ['cellml']},
    {'image/svg+xml': ['celldl']}
]

for (const typeMap of extendedTypes) {
    mime.define(typeMap, true)
}

//==============================================================================

export function mimetype(path: string): string|null {
    return mime.getType(path)
}

//==============================================================================
