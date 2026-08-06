<template>
    <ClientOnly>
        <SvgViewer v-if="validModelView"
            class="celldl-viewer"
            :annotations="annotations"
            :options="viewerOptions"
            :svgData="svgData"
            @error="onError"
            @event="onEvent"
        />
        <div v-else>Cannot explore model...</div>
    </ClientOnly>
</template>

<script setup lang="ts">

//==============================================================================

import '@celldl/viewer/style.css'

import type { Annotations, SvgViewerOptions, ViewerEvent } from '@celldl/viewer'
import SvgViewer from '@celldl/viewer'

import { BROADCAST_RECEIVED_EVENT, BroadcastChannel, type BroadcastObject } from '~/utils/broadcast'
import { OmexArchive } from '~/utils/omexArchive'

//==============================================================================

const annotations = ref<Annotations>({})
const svgData = ref<string>('')
const viewerOptions = ref<SvgViewerOptions>({})

const validModelView = ref<boolean>(false)

enum STATE {
    active = 'Active',
    initialising = 'Intialising'
}

const viewerState = ref<STATE>(STATE.initialising)

const omexArchive = new OmexArchive()

//==============================================================================

const props = defineProps<{
    channel: string
}>()

let broadcastChannel: BroadcastChannel | undefined;

onMounted(async () => {
    document.addEventListener(BROADCAST_RECEIVED_EVENT, onChannelBroadcastReceived)

    broadcastChannel = new BroadcastChannel(props.channel, 'model-viewer')
    await broadcastChannel.send({
        type: 'request',
        data: 'archive'
    })
})

onBeforeUnmount(() => {
    if (broadcastChannel) {
        broadcastChannel.close();
    }
})

async function broadcast(data: BroadcastObject) {
    if (broadcastChannel) {
        await broadcastChannel.send(data);
    }
}

//==============================================================================

const DEFAULT_MODEL_URI_PREFIX = `${window.location.protocol}//${window.location.host}/model`

function makeUri(path: string|undefined): string {
    if (path) {
        if (path.startsWith('file://') || path.startsWith('http://') || path.startsWith('https://')) {
            return (path.endsWith('/') || path.endsWith('#')) ? path : `${path}/`
        } else if (path.startsWith('/')) {
            return (path.endsWith('/') || path.endsWith('#')) ? `${DEFAULT_MODEL_URI_PREFIX}${path}` : `${DEFAULT_MODEL_URI_PREFIX}${path}/`
        } else {
            return (path.endsWith('/') || path.endsWith('#')) ? `${DEFAULT_MODEL_URI_PREFIX}/${path}` : `${DEFAULT_MODEL_URI_PREFIX}/${path}/`
        }
    }
    return `${DEFAULT_MODEL_URI_PREFIX}/`
}

//==============================================================================

async function onChannelBroadcastReceived(event: CustomEvent) {
    const data = event.detail

    if (viewerState.value === STATE.initialising) {
        if (data.type === 'archive') {
            try {
                const omexArchiveData = Uint8Array.fromBase64(data.data)
                await omexArchive.open(makeUri(data.path), omexArchiveData)
                const imageData = await omexArchive.getModelImageData()
                if (imageData) {
                    svgData.value = imageData
                    annotations.value = omexArchive.getViewerAnnotation()
                    viewerOptions.value.tooltip = 'label'
                    viewerState.value = STATE.active
                    validModelView.value = true
                } else {
                    throw new Error('OMEX archive has no CellML model...')
                }
            } catch (error) {
                window.alert(error)
            }
        }
    } else if (data.type === 'select') {
        // select component on diagram
        // needs property passed to viewer with ID of selected component
    }
}

//==============================================================================

function onError(msg: string) {
    window.alert(msg);
}

function onEvent(detail: ViewerEvent) {
    if (detail.type === 'select') {
        const varName = detail.component.annotation.variable
        if (varName) {
            broadcast({
                type: 'select',
                data: varName
            })
        }
    }
}

//==============================================================================
</script>

<style scoped>
.celldl-viewer {
    height: calc(100dvh - 16px);
    border: 2px solid grey;
}
</style>
