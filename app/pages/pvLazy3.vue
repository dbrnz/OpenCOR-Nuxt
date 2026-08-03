<template>
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
            >
                XX {{ node.label }}
            </span>
        </template>
    </Tree>
</template>

<script setup>


//        @nodeSelect="onNodeSelected"
//        v-model:selectionKeys="selectedKeys"


import ChevronDown from '@primeicons/vue/chevron-down';
import ChevronRight from '@primeicons/vue/chevron-right';
import File from '@primeicons/vue/file';
import Folder from '@primeicons/vue/folder';
import FolderOpen from '@primeicons/vue/folder-open';
import Spinner from '@primeicons/vue/spinner';

const nodes = ref(null);

onMounted(() => {
    nodes.value = initiateNodes();

    setTimeout(() => {
        nodes.value.map((node) => (node.loading = false));
    }, 700);
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

const selectedKeys = ref(null);

// Toggle function
const toggleNodeSelection = (nodeKey) => {
    if (selectedKeys.value[nodeKey]) {
        // If already selected, remove it to unselect
        delete selectedKeys.value[nodeKey];
    } else {
        // If not selected, add it to select
        selectedKeys.value[nodeKey] = true;
    }
    // Force Vue to react to the object property modification
    selectedKeys.value = { ...selectedKeys.value };
};

const onNodeExpand = (node) => {
    if (!node.children) {
        node.loading = true;

        setTimeout(() => {
            let _node = { ...node };

            _node.children = [];

            for (let i = 0; i < 3; i++) {
                _node.children.push({
                    key: node.key + '-' + i,
                    label: 'Lazy ' + node.label + '-' + i
                });
            }

            let _nodes = { ...nodes.value };

            _nodes[parseInt(node.key, 10)] = { ..._node, loading: false };

            nodes.value = _nodes;
        }, 500);
    }
};

const initiateNodes = () => {
    return [
        {
            key: '0',
            label: 'Node 0',
            leaf: false,
            loading: true
        },
        {
            key: '1',
            label: 'Node 1',
            leaf: false,
            loading: true
        },
        {
            key: '2',
            label: 'Node 2',
            leaf: false,
            loading: true
        }
    ];
};
</script>
