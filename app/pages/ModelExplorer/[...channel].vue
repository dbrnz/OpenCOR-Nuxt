<template>
    <ClientOnly>
        <SvgViewer v-if="validModelView"
            class="celldl-viewer"
            :annotations="annotations"
            :svgData="svgData"
            @error="onError"
            @event="onEvent"
        />
        <div v-else>Cannot explore model...</div>
    </ClientOnly>
</template>

<script setup lang="ts">
/** biome-ignore-all lint/style/useVueMultiWordComponentNames: <explanation> */

//==============================================================================

import '@celldl/viewer/style.css'

import type { Annotations, ViewerEvent } from '@celldl/viewer'
import SvgViewer from '@celldl/viewer'

import { BROADCAST_RECEIVED_EVENT, BroadcastChannel, type BroadcastObject } from '~/utils/broadcast'
import { OMEX_FORMAT, OmexArchive } from '~/utils/omexArchive'

//==============================================================================

const annotations = ref<Annotations>({})

import { testSvg } from '~/celldl/testsvg'

const svgData = ref<string>(testSvg)

const validModelView = ref<boolean>(false)


enum STATE {
    active = 'Active',
    initialising = 'Intialising'
}

const viewerState = ref<STATE>(STATE.initialising)

const omexArchive = new OmexArchive()

//==============================================================================

const route = useRoute()

let broadcastChannel: BroadcastChannel | undefined;

onMounted(async () => {
    const channel = route.params.channel
    if (channel?.length) {
        document.addEventListener(BROADCAST_RECEIVED_EVENT, onChannelBroadcastReceived)

        broadcastChannel = new BroadcastChannel(channel[0] as string, 'model-viewer')
        await broadcastChannel.send({
            type: 'request',
            data: 'archive'
        })
    }

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



async function onChannelBroadcastReceived(event: CustomEvent) {
    const data = event.detail

    if (viewerState.value === STATE.initialising) {
        if (data.type === 'archive') {
            try {
                const omexArchiveData = Uint8Array.fromBase64(data.data)

                await omexArchive.open(omexArchiveData)
                const cellmlLocation = omexArchive.location(OMEX_FORMAT.cellml)
                if (cellmlLocation) {
                    // query for `<cellml> bqmodel:isDescribedBy ?description`.

                    // Is the resulting `description` a location in the manifest with a format of `image/svg+xml`

                    // if so, load SVG, get label properties for it from the store, and display with tooltips...

                    // Also load cmeta:id/id <--> variable (component/name) mapping from CellML
                    //
                    // Open CellML as XML, get version (2 or < 2) and xpath query variable[@id] or variable[@cmeta:id]

                    viewerState.value = STATE.active
                } else {
                    throw new Error('OMEX archive has no CellML model...')
                }
            } catch (error) {
                window.alert(error)
            }
        }
    }
}

//==============================================================================

function onError(msg: string) {
    window.alert(msg);
}

function onEvent(detail: ViewerEvent) {
    console.log(detail)
}

//==============================================================================
</script>

<style scoped>
.celldl-viewer {
    height: calc(100dvh - 16px);
    border: 2px solid grey;
}
</style>
