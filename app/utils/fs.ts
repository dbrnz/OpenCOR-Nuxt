//==============================================================================

// Get the file extension of a file path

export function getExtension(path: string): string {
    const index = path.lastIndexOf(".")
    return index < 1 ? '' : path.substring(index + 1)
}

//==============================================================================
