<template>
  <div class="bg-gray-900">
    <div class="container mx-auto py-4 px-8">
      <section class="mt-8">
        <div class="flex justify-between mb-4">
          <!-- Dropdown for selecting number of Pokémon per page -->
          <div class="flex items-center">
            <label for="pageSize" class="mr-2 text-white">Pokémon per page:</label>
            <select v-model="pageSize" id="pageSize" class="bg-gray-700 text-white px-2 py-1 rounded">
              <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
            </select>
          </div>

          <!-- Pagination navigation -->
          <div>
            <button @click="prevPage" :disabled="currentPage === 1" 
                    class="px-4 py-2 bg-gray-700 text-white disabled:opacity-50">Previous</button>
            <span class="text-white mx-4">Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages"
                    class="px-4 py-2 bg-gray-700 text-white disabled:opacity-50">Next</button>
          </div>
        </div>

        <div class="relative overflow-x-auto h-screen">
          <table class="w-full text-sm  rtl:text-right table-auto text-gray-500 dark:text-gray-400">
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
                <TableHeader :orders="orders" :order="order" :name="'height'" :label="'Height'" />
                <TableHeader :orders="orders" :order="order" :name="'weight'" :label="'Weight'" />
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
            <tbody class="">
              <tr v-for="(pokemon, key) in paginatedPokemon" :key="key"
                v-show="show(pokemon)"
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
                <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                   {{ pokemon.height }}m
                </td>
                <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ pokemon.weight }}kg
                 </td>
                <td class="px-4 py-2">
                  <button
                    class="grid mb-1 w-fit bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"
                    v-for="(ability, key) in pokemon.abilities" :key="key">{{ ability.name
                    }}</button>
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

        <div class="flex justify-between mt-4">
          <button @click="prevPage" :disabled="currentPage === 1" 
                  class="px-4 py-2 bg-gray-700 text-white disabled:opacity-50">Previous</button>
          <span class="text-white">Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages"
                  class="px-4 py-2 bg-gray-700 text-white disabled:opacity-50">Next</button>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup lang="ts">

const search = ref("")

const pageSizes = [10, 15, 20, 30];
const pageSize = ref(20)
const currentPage = ref(1);

const totalPages = computed(() => {
  if (!data.value) return 1;
  return Math.ceil(data.value.length / pageSize.value);
});

const paginatedPokemon = computed(() => {
  if (!data.value) return [];
  const start = (currentPage.value - 1) * pageSize.value;
  return data.value.slice(start, start + pageSize.value);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

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
  abilities: Ability[]
  base_stats: BaseStats,
  height: number,
  weight: number,
}
type SortOrder = 'asc' | 'desc';

const data = ref<Pokemon[] | null>(null);

const orders = reactive({
  "name": "id",
  "ordering": <SortOrder>"asc",
});

const order = (key: string) => {
  let ordering: SortOrder = 'asc'
  if (orders.name == key) {
    ordering = orders.ordering == 'asc' ? 'desc' : 'asc';
  }

  orders.name = key;
  orders.ordering = ordering

  const shuffledData = useOrderBy(data.value, key, ordering);
  data.value = shuffledData
}

const show = (pokemon:Pokemon) => {
  if (search.value === '') {
    return true
  }

  const isPokemonName = pokemon.name.toLowerCase().indexOf(search.value.toLowerCase()) !== -1
  const isPokemonAbility = pokemon.abilities.filter((ability:Ability) => ability.name.toLowerCase().indexOf(search.value.toLowerCase()) !== -1).length > 0;

  return isPokemonName || isPokemonAbility
}

onMounted(async () => {
  const { data: fetchedData } = await useFetch<Pokemon[]>("pokemon.min.json");
  data.value = fetchedData.value
});
</script>
