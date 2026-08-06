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
