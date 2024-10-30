<template>
  <th scope="col" class="px-4 py-2 cursor-pointer"  :class="[
      ' dark:hover:bg-gray-500 dark:hover:text-gray-900',
      {
        'bg-red-200 dark:bg-gray-600 text-white': orders.name === name,
      }
    ]"
    @click="order(name)">
    {{ label }}
    <span v-if="orders.name == name && orders.ordering == 'asc'" class="float-end" v-html="'&uarr;'"></span>
    <span v-if="orders.name == name && orders.ordering == 'desc'" class="float-end" v-html="'&darr;'"></span>
  </th>
</template>

<script setup>
  const { orders, order, name, label } = defineProps(["orders", "order", "name", "label"]);
</script>
