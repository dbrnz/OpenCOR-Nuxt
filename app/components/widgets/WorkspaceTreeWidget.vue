<template>
<ClientOnly>
    <TreeTable
    :value="nodes"
    loadingMode="icon"
    selectionMode="single"
    size="small"
    v-model:selectionKeys="selectedKeys"
    v-model:expandedKeys="expandedKeys"
    @nodeExpand="onNodeExpand"
    @nodeCollapse="onNodeCollapse"
    @nodeSelect="onNodeSelected"
    @nodeUnselect="onNodeUnselected"
    :resizableColumns="true"
    showGridlines
    sortField="name"
    :sortOrder="1"
    scrollable scrollHeight="400px"
    class="w-full md:w-120"
    tableStyle="min-width: 50rem">
        <Column field="name" header="Name" expander sortable style="width: 45%">
            <template #body="{ node }">
                <span class="inline-flex items-center gap-2">
                    <File v-if="node.leaf" class="mr-2" />
                    <FolderOpen v-else-if="node.data.expanded" class="mr-2" />
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

import type { FsEntry } from '#server/utils/fs'

import { getExtension } from '~/utils/fs'

//==============================================================================

const MAX_DOUBLE_CLICK_TIME = 250   // milliseconds
const MODELLING_STATE_STORAGE_KEY = 'modelling_workspace_state'

//==============================================================================

// Props

const props = defineProps<{
    fileTypes?: string[]
}>()

// Emits

const emit = defineEmits<{
  (event: 'select', filePath: string): void
  (event: 'unSelect', filePath: string): void
  (event: 'fileSelected', filePath: string): void
}>();

//==============================================================================

const nodes = ref<TreeNode[]>([])
const expandedKeys = ref<Record<string, boolean>>({})
const selectedKeys = ref<Record<string, boolean>>({})

//==============================================================================

function buildDirectoryTree(dirList?: FsEntry[]): TreeNode[] {
    const tree: TreeNode[] = []
    if (dirList) {
        for (const entry of dirList) {
            const node = {
                key: entry.path,
                label: entry.name,
                data: entry,
                leaf: !entry.isDirectory,
                selectable: !props.fileTypes
                          || props.fileTypes.length === 0
                          || props.fileTypes.includes(getExtension(entry.name))
            }
            tree.push(node)
        }
    }
    return tree
}

//==============================================================================

onMounted(async () => {
    const dirList = await $fetch<FsEntry>('/api/dir')
    nodes.value = buildDirectoryTree(dirList.children)
    // get expanded keys from local storage
    expandedKeys.value = JSON.parse(localStorage.getItem(MODELLING_STATE_STORAGE_KEY) || '{}')
})

onUnmounted(() => {
    // save expanded keys to local storage
    localStorage.setItem(MODELLING_STATE_STORAGE_KEY, JSON.stringify(expandedKeys.value))
})

//==============================================================================

let lastClickTime = Date.now()

function onNodeSelected(node: TreeNode) {
    emit('select', node.key)
    lastClickTime = Date.now()
}

async function onNodeUnselected(node: TreeNode) {
    if ((Date.now() - lastClickTime) < MAX_DOUBLE_CLICK_TIME) {
        await nextTick()
        selectedKeys.value = { [node.key]: true }
        emit('fileSelected', node.key)
    } else {
        lastClickTime = Date.now()
        emit('unSelect', node.key)
    }
}

//==============================================================================

async function onNodeExpand(node: TreeNode) {
    if (!node.children) {
        node.loading = true
        const dirList = await $fetch<FsEntry>(`/api/dir/${node.data.path}`)
        node.children = buildDirectoryTree(dirList.children)
        node.loading = false
    }
    node.data.expanded = true
}

function onNodeCollapse(node: TreeNode) {
    node.data.expanded = false
}

//==============================================================================
</script>
