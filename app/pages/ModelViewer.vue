<template>
       <ClientOnly>
            <SvgViewer
                class="celldl-viewer"
                :annotations="annotations"
                :svgData="svgData"
                @error="onError"
                @event="onEvent"
            />
      </ClientOnly>
</template>

<script setup lang="ts">

import '@celldl/viewer/style.css';

import SvgViewer from '@celldl/viewer'

import type { Annotations, ViewerEvent } from '@celldl/viewer'

import { testSvg } from '~/celldl/testsvg'

const annotations = ref<Annotations>({})

const svgData = ref<string>(testSvg)

function onError(msg: string) {
  window.alert(msg);
}

function onEvent(detail: ViewerEvent) {
    console.log(detail)
}
</script>

<style scoped>
.celldl-viewer {
    height: calc(100dvh - 16px);
    border: 2px solid grey;
}
</style>
