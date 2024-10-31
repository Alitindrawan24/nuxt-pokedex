<template>
  <div :class="{'bg-gray-100': !isDark, 'bg-gray-900': isDark}" class="transition-colors duration-700">
    <div class="container px-8 py-4 mx-auto">
      <section class="mt-8">
        <div class="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">

          <!-- Dropdown for selecting number of Pokémon per page -->
          <div class="flex items-center">
            <label for="pageSize" class="mr-2" :class="{'text-gray-800': !isDark, 'text-white': isDark}">
              Pokémon per page:
            </label>
            <select v-model="pageSize" id="pageSize" class="px-2 py-1 rounded" :class="{'bg-[#afe0eb] text-gray-800 border-gray-300': !isDark,'bg-gray-700 text-white border-gray-600': isDark}"
            >
              <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
            </select>
          </div>

           <!-- Dropdown for filtering Pokémon by type -->
           <div class="flex items-center">
            <label 
              for="typeFilter" 
              class="mr-2"
              :class="{'text-gray-800': !isDark, 'text-white': isDark}"
            >
              Filter by type:
            </label>
            <select 
              v-model="selectedType" 
              id="typeFilter" 
              class="px-2 py-1 border rounded"
              :class="{'bg-[#afe0eb] text-gray-800 border-gray-300': !isDark, 
                      'bg-gray-700 text-white border-gray-600': isDark}"
            >
              <option value="">All Types</option>
              <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <!-- Search Pokemon -->
          <div class="flex items-center justify-center">
            <label for="pokemon_name" class="mr-2 block text-sm font-medium" :class="{'text-gray-800': !isDark, 'text-white': isDark}"
            > Search:
            </label>
            <input v-model="search" type="text" id="pokemon_name"
              class="text-sm rounded-lg block w-full max-w-sm px-2.5 py-2 border focus:ring-blue-500 focus:border-blue-500"
              :class="{'bg-[#afe0eb] text-gray-800 placeholder:text-gray-800 border-gray-300': !isDark, 
                      'bg-gray-700 text-white border-gray-600': isDark}"
              placeholder="Enter pokemon name..." 
            />
          </div>

          <!-- Pagination navigation -->
          <div class="flex items-center justify-between">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-4 py-2 rounded disabled:opacity-50"
              :class="{'bg-[#afe0eb] text-gray-800 border-gray-300': !isDark, 
                      'bg-gray-700 text-white border-gray-600': isDark}"
            >
              Previous
            </button>
            <span 
              class="mx-4"
              :class="{'text-gray-800': !isDark, 'text-white': isDark}"
            >
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="px-4 py-2 rounded disabled:opacity-50"
              :class="{'bg-[#afe0eb] text-gray-800 border-gray-300': !isDark, 
                      'bg-gray-700 text-white border-gray-600': isDark}"
            >
              Next
            </button>
          </div>

        <div class="flex justify-end ">
        <button   
          @click="handleThemeToggle" 
          class="relative flex items-center justify-center gap-2 px-3 py-3 overflow-hidden transition-all duration-500 border rounded-full"
          :class="{'bg-gray-200 text-gray-800 border-gray-300': !isDark, 
                  'bg-gray-700 text-white border-gray-600': isDark}"
        >
          <div class="relative flex items-center w-5 h-5">
            <Icon 
              name="ph:moon-bold"
              class="absolute w-5 h-5 transition-all duration-500"
              :class="[
                isDark ? 'transform-none opacity-100' : 'scale-150 opacity-0',
                isAnimating ? 'spin-animation' : ''
              ]"
            />
            <Icon 
              name="ph:sun-bold"`
              class="absolute w-5 h-5 transition-all duration-500"
              :class="[
                !isDark ? 'transform-none opacity-100' : 'scale-150 opacity-0',
                isAnimating ? 'spin-animation' : ''
              ]"
            />
          </div>
          <!-- Ripple effect -->
          <div 
            v-if="isAnimating"
            class="absolute inset-0 -z-10"
          >
            <div 
              class="absolute inset-0 rounded-lg ripple-effect"
              :class="isDark ? 'bg-gray-600' : 'bg-gray-300'"
            />
          </div>
        </button>
      </div>
        </div>

        <div class="relative h-screen overflow-x-auto">
          <table class="w-full text-sm table-auto">
            <thead :class="{'bg-[#bfe9f3] text-gray-600': !isDark, 'bg-gray-700 text-gray-400': isDark}">
              <tr>
                <TableHeader :orders="orders" :order="order" :name="'id'" :label="'No'"/>
                <th scope="col" class="px-4 py-2">Image</th>
                <TableHeader :orders="orders" :order="order" :name="'name'" :label="'Name'" />
                <th scope="col" class="px-4 py-2">Type</th>
                <TableHeader :orders="orders" :order="order" :name="'height'" :label="'Height'" />
                <TableHeader :orders="orders" :order="order" :name="'weight'" :label="'Weight'" />
                <th scope="col" class="px-4 py-2">Ability</th>
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
              <tr 
                v-for="(pokemon, key) in paginatedPokemon" 
                :key="key"
                v-show="show(pokemon)"
                :class="[
                  isDark ? 'bg-slate-900' : 'bg-white',
                  'border-b',
                  isDark ? 'border-gray-700' : 'border-gray-200',
                  `bg-gradient-to-r from-${pokemon.types[0].name} via-${pokemon.types[0].name}/75 to-${pokemon.types[0].name}/50`
                ]"
              >
                <th scope="row" class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.id }}
                </th>
                <td class="px-4 py-2">
                  <NuxtImg :src="pokemon.sprite" :alt="pokemon.name" loading="lazy" />
                </td>
                <td class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.name }}
                </td>
                <td>
                  <div class="flex">
                    <img v-for="(types, key) in pokemon.types" :key="key" :src="types.gif" :alt="types.name" />
                  </div>
                </td>
                <td class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.height }}m
                </td>
                <td class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.weight }}kg
                </td>
                <td class="px-4 py-2">
                  <button
                    v-for="(ability, key) in pokemon.abilities" 
                    :key="key"
                    class="grid mb-1 w-fit text-xs font-medium me-2 px-2.5 py-0.5 rounded"
                    :class="{'bg-red-100 text-gray-800': !isDark, 'bg-gray-700 text-gray-300': isDark}"
                  >
                    {{ ability.name }}
                  </button>
                </td>
                <td class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.base_stats.hp }}
                </td>
                <td class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.base_stats.attack }}
                </td>
                <td class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.base_stats.defense }}
                </td>
                <td class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.base_stats.special_attack }}
                </td>
                <td class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.base_stats.special_defense }}
                </td>
                <td class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.base_stats.speed }}
                </td>
                <td class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.base_stats.total }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between mt-4">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded disabled:opacity-50"
            :class="{'bg-[#bfe9f3] text-gray-800 border-gray-300': !isDark, 
                    'bg-gray-700 text-white border-gray-600': isDark}"
          >
            Previous
          </button>
          <span :class="{'text-gray-800': !isDark, 'text-white': isDark}">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded disabled:opacity-50"
            :class="{'bg-[#bfe9f3] text-gray-800 border-gray-300': !isDark, 
                    'bg-gray-700 text-white border-gray-600': isDark}"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const isDark = ref(true);
const isAnimating = ref(false);

const handleThemeToggle = () => {
  isAnimating.value = true;
  setTimeout(() => {
    isDark.value = !isDark.value;
    setTimeout(() => {
      isAnimating.value = false;
    }, 500);
  }, 150);
};
const toggleTheme = () => {
  isDark.value = !isDark.value;
};

const search = ref("");
const selectedType = ref("");
const types = ref<string[]>([]);

const pageSizes = [10, 15, 20, 30];
const pageSize = ref(20);
const currentPage = ref(1);

const totalPages = computed(() => {
  if (!filteredPokemon.value) return 1;
  return Math.ceil(filteredPokemon.value.length / pageSize.value);
});

const paginatedPokemon = computed(() => {
  if (!filteredPokemon.value) return [];
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredPokemon.value.slice(start, start + pageSize.value);
});

const filteredPokemon = computed(() => {
  if (!data.value) return [];

  let filtered = data.value;
  if (selectedType.value !== "") {
    filtered = filtered.filter((pokemon) =>
      pokemon.types.some((type) => type.name === selectedType.value)
    );
  }
  
  if (search.value !== '') {
    filtered = filtered.filter((pokemon) => {
      const isPokemonName = pokemon.name.toLowerCase().indexOf(search.value.toLowerCase()) !== -1
      const isPokemonAbility = pokemon.abilities.filter((ability:Ability) => 
        ability.name.toLowerCase().indexOf(search.value.toLowerCase()) !== -1
      ).length > 0;

      return isPokemonName || isPokemonAbility
    });
  }

  return filtered;
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
  abilities: Ability[],
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
  let ordering: SortOrder = 'asc';
  if (orders.name == key) {
    ordering = orders.ordering == 'asc' ? 'desc' : 'asc';
  }

  orders.name = key
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
  data.value = fetchedData.value;

  // Extract unique types from the Pokémon data
  const allTypes = new Set<string>();
  data.value.forEach((pokemon) => {
    pokemon.types.forEach((type) => {
      allTypes.add(type.name);
    });
  });

  // Convert Set to Array and update types
  types.value = Array.from(allTypes);
});

</script>


<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-animation {
  animation: spin 0.5s ease-out;
}

@keyframes ripple {
  0% { 
    transform: scale(0); 
    opacity: 1; 
  }
  100% { 
    transform: scale(2); 
    opacity: 0; 
  }
}

.ripple-effect {
  animation: ripple 0.6s ease-out;
}
</style>
