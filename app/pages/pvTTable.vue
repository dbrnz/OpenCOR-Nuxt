<template>
<ClientOnly>
    <TreeTable
    :value="nodes"
    loadingMode="icon"
    selectionMode="single"
    v-model:selectionKeys="selectedKey"
    @node-expand="onNodeExpand"
    @nodeSelect="onNodeSelected"
    @nodeUnselect="onNodeUnselected"
    :resizableColumns="true"
    showGridlines
    scrollable scrollHeight="400px"
    class="w-full md:w-120"
    tableStyle="min-width: 50rem">
        <Column field="name" header="Name" expander sortable style="width: 45%">
            <template #body="{ node }">
                <span class="inline-flex items-center gap-2">
                    <File v-if="node.leaf" class="mr-2" />
                    <FolderOpen v-else-if="node.expanded" class="mr-2" />
                    <Folder v-else class="mr-2" /></span>
                <span :id="node.key"> {{ node.data.name }} </span>
            </template>
        </Column>
        <Column field="modified" header="Date Modified" sortable style="width: 40%"></Column>
        <Column field="size" sortable style="width: 15%">
        <template #header>
            <div class="w-full text-right" style="width: 100%; text-align: right;">
                Size
            </div>
        </template>
        <template #body="{ node }">
            <div style="width: 100%; text-align: right;">
                {{ node.data.size }}
            </div>
        </template>
        </Column>
    </TreeTable>
</ClientOnly>
</template>


<script setup lang="ts">

import File from '@primeicons/vue/file';
import Folder from '@primeicons/vue/folder';
import FolderOpen from '@primeicons/vue/folder-open';

import type { TreeNode } from 'primevue/treenode'

const nodes = ref<TreeNode[]>([])
const selectedKey = ref<Record<string, boolean>>({})

const dirtree = ref(null)

//import type { FSEntry } from '#server/utils/fs'
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

function buildDirectoryTree(dirList?: FsEntry[]): TreeNode[] {
    const tree: TreeNode[] = []
    if (dirList) {
        for (const entry of dirList) {
            tree.push({
                key: entry.path,
                label: entry.name,
                data: entry,
                leaf: !entry.isDirectory
            })
        }
    }
    return tree
}

onMounted(async () => {
  const dirList = await $fetch<FsEntry[]>('/api/dir')
  nodes.value = buildDirectoryTree(dirList)

  console.log(dirtree.value)
})

let lastClickTime = Date.now()

function onNodeSelected(node: TreeNode) {
    console.log('Selected', node.key, selectedKey.value)
    lastClickTime = Date.now()
}

const MAX_DOUBLE_CLICK_TIME = 200   // milliseconds

async function onNodeUnselected(node: TreeNode) {
    if ((Date.now() - lastClickTime) < MAX_DOUBLE_CLICK_TIME) {
        await nextTick()
        selectedKey.value = { [node.key]: true }
        console.log('Double click!!', node.key, selectedKey.value)
    } else {
        lastClickTime = Date.now()
        console.log('Unselected', node.key, selectedKey.value)
    }
}

async function onNodeExpand(node: TreeNode) {
    if (!node.children) {
        node.loading = true
        const dirList = await $fetch<FsEntry[]>(`/api/dir/${node.data.path}`)
        node.children = buildDirectoryTree(dirList)
        node.loading = false
    }
}
</script>
