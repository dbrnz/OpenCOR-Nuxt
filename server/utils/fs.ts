//==============================================================================
// Based on https://github.com/lijo-jose/git-browse/blob/main/lib/fs.ts
//==============================================================================

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

//==============================================================================

import { resolvePath } from './environment'

//==============================================================================

export interface FsEntry {
    name: string
    path: string
    isDirectory: boolean
    isGitRepo: boolean
    branch?: string
    isIgnored?: boolean
    size?: number
    modified?: string
}

//==============================================================================

function getIgnoredNames(dirPath: string, names: string[]): Set<string> {
    try {
        const input = names.join('\0')
        const out = execSync('git check-ignore -z --stdin', {
            cwd: dirPath,
            input,
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore']
        })
        return new Set(
            out
                .split('\0')
                .map((p) => path.basename(p))
                .filter(Boolean)
        )
    } catch {
        return new Set()
    }
}

//==============================================================================

function readBranch(repoPath: string): string | undefined {
    try {
        let gitDir = path.join(repoPath, '.git')
        const stat = fs.statSync(gitDir)
        if (stat.isFile()) {
            // Worktree/submodule: .git is a file pointing to the real git dir
            const m = fs.readFileSync(gitDir, 'utf8').match(/^gitdir:\s*(.+)$/m)
            if (!m) return undefined
            // @ts-expect-error
            gitDir = path.resolve(repoPath, m[1].trim())
        }
        const head = fs.readFileSync(path.join(gitDir, 'HEAD'), 'utf8').trim()
        const ref = head.match(/^ref:\s*refs\/heads\/(.+)$/)
        if (ref) return ref[1]
        return head.slice(0, 7) // detached HEAD
    } catch {
        return undefined
    }
}

//==============================================================================

function getStat(path: string): fs.Stats | undefined {
    try {
        return fs.statSync(path)
    } catch {
        // ignore
    }
}

//==============================================================================

export function listDirectory(dirPath: string): FsEntry[]|undefined {
    const resolved = resolvePath(dirPath)
    if (!resolved) {
        return
    }

    let entries: fs.Dirent[] = []
    try {
        entries = fs.readdirSync(resolved, { withFileTypes: true })
    } catch(_) {
        const stat = getStat(resolved)
        return [{
            name: path.basename(resolved),
            path: resolved,
            isDirectory: false,
            isGitRepo: false,
            size: stat?.size,
            modified: stat?.mtime.toISOString()
        }]
    }

    const visible = entries.filter((e) => e.name !== '.git')

    const ignoredNames = getIgnoredNames(
        resolved,
        visible.map((e) => e.name)
    )

    return visible
        .map((e) => {
            const fullPath = path.join(resolved, e.name)
            const isDir = e.isDirectory()
            let isGitRepo = false
            if (isDir) {
                try {
                    isGitRepo = fs.existsSync(path.join(fullPath, '.git'))
                } catch {
                    // ignore
                }
            }
            const stat = getStat(fullPath)
            return {
                name: e.name,
                path: fullPath,
                isDirectory: isDir,
                isGitRepo,
                branch: isGitRepo ? readBranch(fullPath) : undefined,
                isIgnored: ignoredNames.has(e.name),
                size: stat?.size,
                modified: stat?.mtime.toISOString()
            }
        })
        .sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
            return a.name.localeCompare(b.name)
        })
}

//==============================================================================
