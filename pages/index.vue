<template>
  <div class="bg-gray-900">
    <div class="container mx-auto py-4 px-8">
      <section class="mt-8">
        <div class="grid gap-6 mb-6 md:grid-cols-3">
          <div>
            <label for="pokemon_name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Search</label>
            <input v-model="search" type="text" id="pokemon_name"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter pokemon / ability" autocomplete="off"/>
          </div>
          <!-- Type Filter Dropdown -->
          <div>
            <label for="pokemon_type" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Filter by Type</label>
            <select v-model="selectedType" id="pokemon_type" 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option value="">All</option>
              <option v-for="type in uniqueTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
        </div>

        <div class="relative overflow-x-auto h-screen">
          <table class="w-full text-sm rtl:text-right table-auto text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <TableHeader :orders="orders" :order="order" :name="'id'" :label="'No'" />
                <th scope="col" class="px-4 py-2">
                  Image
                </th>
                <TableHeader :orders="orders" :order="order" :name="'name'" :label="'Name'" />
                <th scope="col" class="px-4 py-2">
                  Type
                </th>
                <th scope="col" class="px-4 py-2">
                  Ability
                </th>
                <TableHeader :orders="orders" :order="order" :name="'base_stats.hp'" :label="'HP'" />
                <TableHeader :orders="orders" :order="order" :name="'base_stats.attack'" :label="'ATK'" />
                <TableHeader :orders="orders" :order="order" :name="'base_stats.defense'" :label="'DEF'" />
                <TableHeader :orders="orders" :order="order" :name="'base_stats.special_attack'" :label="'SPA'" />
                <TableHeader :orders="orders" :order="order" :name="'base_stats.special_defense'" :label="'SPD'" />
                <TableHeader :orders="orders" :order="order" :name="'base_stats.speed'" :label="'SPE'" />
                <TableHeader :orders="orders" :order="order" :name="'base_stats.total'" :label="'BST'" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pokemon, key) in filteredData" :key="key"
                :class="`bg-slate-900 border-b dark:border-gray-700 bg-gradient-to-r from-${pokemon.types[0].name} via-${pokemon.types[0].name}/75 to-${pokemon.types[0].name}/50`">
                <th scope="row" class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ pokemon.id }}
                </th>
                <td class="px-4 py-2">
                  <NuxtImg :src="pokemon.sprite" :alt="pokemon.name" loading="lazy" />
                </td>
                <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ pokemon.name }}
                </td>
                <td>
                  <div class="flex">
                    <img v-for="(types, key) in pokemon.types" :key="key" :src="types.gif" :alt="types.name" />
                  </div>
                </td>
                <td class="px-4 py-2">
                  <button
                    class="grid mb-1 w-fit bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"
                    v-for="(ability, key) in pokemon.abilities" :key="key">{{ ability.name }}</button>
                </td>
                <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ pokemon.base_stats.hp }}
                </td>
                <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ pokemon.base_stats.attack }}
                </td>
                <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ pokemon.base_stats.defense }}
                </td>
                <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ pokemon.base_stats.special_attack }}
                </td>
                <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ pokemon.base_stats.special_defense }}
                </td>
                <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ pokemon.base_stats.speed }}
                </td>
                <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ pokemon.base_stats.total }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const search = ref("");
const selectedType = ref(""); // New variable for the selected type filter
const data = ref<Pokemon[] | null>(null);

interface Type {
  name: string,
  gif: string,
}
interface Ability {
  name: string,
}
interface BaseStats {
  hp: number,
  attack: number,
  defense: number,
  special_attack: number,
  special_defense: number,
  speed: number,
  total: number;
}
interface Pokemon {
  id: string,
  name: string,
  sprite: string,
  types: Type[],
  abilities: Ability[],
  base_stats: BaseStats,
}
type SortOrder = 'asc' | 'desc';

const orders = reactive({
  "name": "id",
  "ordering": <SortOrder>"asc",
});

const order = (key: string) => {
  let ordering: SortOrder = 'asc';
  if (orders.name == key) {
    ordering = orders.ordering == 'asc' ? 'desc' : 'asc';
  }

  orders.name = key;
  orders.ordering = ordering;

  const shuffledData = useOrderBy(data.value, key, ordering);
  data.value = shuffledData;
};

// Compute the unique types for the filter dropdown
const uniqueTypes = computed(() => {
  const types = new Set();
  if (data.value) {
    data.value.forEach(pokemon => {
      pokemon.types.forEach(type => {
        types.add(type.name);
      });
    });
  }
  return Array.from(types);
});

// Computed property to filter the displayed data
const filteredData = computed(() => {
  return data.value?.filter(pokemon => {
    const matchesSearch = show(pokemon);
    const matchesType = selectedType.value ? pokemon.types.some(type => type.name === selectedType.value) : true;
    return matchesSearch && matchesType;
  }) || [];
});

const show = (pokemon: Pokemon) => {
  if (search.value === '') {
    return true;
  }

  const isPokemonName = pokemon.name.toLowerCase().indexOf(search.value.toLowerCase()) !== -1;
  const isPokemonAbility = pokemon.abilities.filter((ability: Ability) => ability.name.toLowerCase().indexOf(search.value.toLowerCase()) !== -1).length > 0;

  return isPokemonName || isPokemonAbility;
}

onMounted(async () => {
  const { data: fetchedData } = await useFetch<Pokemon[]>("pokemon.min.json");
  data.value = fetchedData.value;
});
</script>

