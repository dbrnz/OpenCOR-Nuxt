<template>
    <BaseDialog header="Open from Workspace..." class="w-250">
        <WorkspaceTreeWidget class="items-center mt-2 mb-4"
            :file-types="fileTypes"
            @select="onSelectEvent"
            @un-select="onUnselectEvent"
            @fileSelected="onFileSelectedEvent"
        />
        <template #footer>
            <Button label="Open" :disabled="!selectedFilePath" @click="emitOpenWorkspace" />
            <Button label="Cancel" severity="secondary" @click="emitClose" />
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">

// Emits

const emit = defineEmits<{
    (event: 'openWorkspaceFile', path: string): void;
    (event: 'close'): void;
}>()

//==============================================================================

// Passed props

const fileTypes = ref<string[]>(['cellml', 'omex'])

//==============================================================================

const selectedFilePath = ref<string|null>(null)

function onSelectEvent(filePath: string): void {
    selectedFilePath.value = filePath
}

function onUnselectEvent(): void {
    selectedFilePath.value = null
}

function onFileSelectedEvent(filePath: string): void  {
    selectedFilePath.value = filePath
    emitOpenWorkspace()
}

//==============================================================================

function emitOpenWorkspace(): void {
    if (!selectedFilePath.value) {
        return
    }
    emit('openWorkspaceFile', selectedFilePath.value)
    emitClose()
}

function emitClose(): void {
    selectedFilePath.value = null
    emit('close')
}

//==============================================================================
</script>
