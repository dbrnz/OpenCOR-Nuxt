<template>
    <ClientOnly>
        <WrappedViewer
            :channel="channel"
        />
    </ClientOnly>
</template>

<script setup lang="ts">
/** biome-ignore-all lint/style/useVueMultiWordComponentNames: <explanation> */

import initOxigraph from 'oxigraph/web.js'
import * as oxigraph from 'oxigraph/web.js'

const channel = ref<string>('')

const route = useRoute()

if (route.params.channel) {
    channel.value = route.params.channel[0] as string
}

// Load oxigraph's WASM module before the viewer is imported

const WrappedViewer = defineAsyncComponent(async () => {
    const wasm = await initOxigraph()
    globalThis.oxigraph = oxigraph
    return import('~/components/ModelViewer.vue')
})
</script>
