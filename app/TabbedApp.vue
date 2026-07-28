<template>
  <Tabs value="0">
    <TabList>
      <Tab value="0">OpenCOR</Tab>
      <Tab value="1">CellDL Editor</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <OpenCOR />
      </TabPanel>
      <TabPanel value="1">
        ...
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style>
  @import "tailwindcss/preflight.css" layer(base);
</style>

<style scoped>
  .p-tabpanels {
    border: 1px solid red;
    flex-grow: 1;
    height: 800px;
  }
</style>
