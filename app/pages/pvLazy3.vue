<template>
<ClientOnly>
    <Tree :value="nodes" @node-expand="onNodeExpand" loadingMode="icon" class="w-full md:w-120"
        selectionMode="single"

    >
        <template #nodetoggleicon="{ node, expanded }">
            <Spinner v-if="node.loading" class="animate-spin" />
            <ChevronDown v-else-if="expanded" />
            <ChevronRight v-else />
        </template>
        <template #nodeicon="{ node }">
            <File v-if="node.leaf" class="mr-2" />
            <FolderOpen v-else-if="node.expanded" class="mr-2" />
            <Folder v-else class="mr-2" />
        </template>
        <!-- Use the custom node slot to expose slotProps -->
        <template #default="{ node, selected, expanded }">
            <span
                @click="onNodeClick($event, node)"
                @dblclick="onNodeDblClick($event, node)"
                :id="node.key"
                class="cursor-pointer w-full display-block"
            > {{ node.label }} </span>
        </template>
    </Tree>
</ClientOnly>
</template>

<script setup lang="ts">

//        @nodeSelect="onNodeSelected"
//        v-model:selectionKeys="selectedKeys"

import ChevronDown from '@primeicons/vue/chevron-down';
import ChevronRight from '@primeicons/vue/chevron-right';
import File from '@primeicons/vue/file';
import Folder from '@primeicons/vue/folder';
import FolderOpen from '@primeicons/vue/folder-open';
import Spinner from '@primeicons/vue/spinner';

import type { TreeNode } from 'primevue/treenode'

const nodes = ref<TreeNode[]>([]);


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
                data: entry.path,
                leaf: !entry.isDirectory
            })
        }
    }
    return tree
}

onMounted(async () => {
  const dirList = await $fetch<FsEntry[]>('/api/dir')
  nodes.value = buildDirectoryTree(dirList)
});

const onNodeSelected = (event, node) => {
    console.log('Selected', event, node)
}

const onNodeClick = (event, node) => {
    console.log('Click', event, node, selectedKeys.value)

    event.target.parentElement.parentElement.classList.add('p-tree-node-selected')
    selectedKeys.value = { }
}

const onNodeDblClick = (event, node) => {
    console.log('Dbl click', event, node)
}

const selectedKeys = ref<Record<string, boolean>>(null);

// Toggle function
const toggleNodeSelection = (key: string) => {
    if (selectedKeys.value[key]) {
        // If already selected, remove it to unselect
        delete selectedKeys.value[key]
    } else {
        // If not selected, add it to select
        selectedKeys.value[key] = true
    }
    // Force Vue to react to the object property modification
    selectedKeys.value = { ...selectedKeys.value };
};


async function onNodeExpand(node: TreeNode) {
    if (!node.children) {
        node.loading = true
        const dirList = await $fetch<FsEntry[]>(`/api/dir/${node.data}`)
        node.children = buildDirectoryTree(dirList)
        node.loading = false
    }
}
</script>
