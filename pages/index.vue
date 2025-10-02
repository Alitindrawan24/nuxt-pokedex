<template>
  <div 
    :class="[
      {'bg-gray-100': !isDark && !selectedPokemon, 'bg-gray-900': isDark && !selectedPokemon}
    ]" 
    :style="selectedPokemon ? getBackgroundStyle(selectedPokemon.types[0].name) : ''"
    class="transition-all duration-700 min-h-screen"
  >
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

        <div class="flex justify-end gap-2">
        <!-- Clear Selection Button -->
        <button
          v-if="selectedPokemon"
          @click="clearSelection"
          class="relative flex items-center justify-center gap-2 px-3 py-2 overflow-hidden transition-all duration-500 border rounded-full text-sm"
          :class="{'bg-red-100 text-red-800 border-red-300 hover:bg-red-200': !isDark,
                  'bg-red-900 text-red-200 border-red-700 hover:bg-red-800': isDark}"
        >
          Clear Selection
        </button>
        
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
              name="ph:sun-bold"
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
                  'border-b transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer',
                  isDark ? 'border-gray-700' : 'border-gray-200',
                  selectedPokemon?.id === pokemon.id ? 'ring-2 ring-blue-500 bg-blue-50' : '',
                  `bg-gradient-to-r from-${pokemon.types[0].name} via-${pokemon.types[0].name}/75 to-${pokemon.types[0].name}/50`
                ]"
                @click="selectPokemon(pokemon)"
              >
                <th scope="row" class="px-4 py-2 font-medium whitespace-nowrap"
                    :class="{'text-gray-900': !isDark, 'text-white': isDark}">
                  {{ pokemon.id }}
                </th>
                <td class="px-4 py-2">
                  <div class="pokemon-image-container cursor-pointer" @click="selectPokemon(pokemon)">
                    <NuxtImg 
                      :src="pokemon.sprite" 
                      :alt="pokemon.name" 
                      loading="lazy" 
                      class="pokemon-sprite transition-all duration-300 hover:scale-125 hover:rotate-12 hover:drop-shadow-lg"
                    />
                  </div>
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

    <!-- Pokemon Description Modal -->
    <div 
      v-if="selectedPokemon && showModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeModal"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 border-t-4"
        :style="{ borderTopColor: typeColors[selectedPokemon.types[0].name as keyof typeof typeColors]?.dark || '#6B7280' }"
        @click.stop
      >
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {{ selectedPokemon.name }}
          </h2>
          <button 
            @click="closeModal"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>
        
        <div class="flex flex-col items-center mb-4">
          <div class="pokemon-modal-image mb-4">
            <NuxtImg 
              :src="selectedPokemon.sprite" 
              :alt="selectedPokemon.name" 
              class="w-24 h-24 mx-auto animate-bounce"
            />
          </div>
          
          <div class="flex gap-2 mb-4 justify-center">
            <img 
              v-for="(type, key) in selectedPokemon.types" 
              :key="key" 
              :src="type.gif" 
              :alt="type.name" 
              class="w-16 h-12 object-contain"
            />
          </div>
        </div>

        <div class="space-y-3 text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Height:</span>
              <span class="text-gray-900 dark:text-white ml-2">{{ selectedPokemon.height }}m</span>
            </div>
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Weight:</span>
              <span class="text-gray-900 dark:text-white ml-2">{{ selectedPokemon.weight }}kg</span>
            </div>
          </div>
          
          <div>
            <span class="font-semibold text-gray-700 dark:text-gray-300">Abilities:</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span 
                v-for="(ability, key) in selectedPokemon.abilities" 
                :key="key"
                class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs capitalize"
              >
                {{ ability.name }}
              </span>
            </div>
          </div>

          <div>
            <span class="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Base Stats:</span>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600 dark:text-gray-400">HP</span>
                <div class="flex items-center gap-2">
                  <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-green-500 h-2 rounded-full transition-all duration-500 animate-fill-bar"
                      :style="`width: ${(selectedPokemon.base_stats.hp / 255) * 100}%`"
                    ></div>
                  </div>
                  <span class="text-xs font-medium w-8 text-gray-900 dark:text-white">{{ selectedPokemon.base_stats.hp }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600 dark:text-gray-400">ATK</span>
                <div class="flex items-center gap-2">
                  <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-red-500 h-2 rounded-full transition-all duration-500 animate-fill-bar"
                      :style="`width: ${(selectedPokemon.base_stats.attack / 255) * 100}%`"
                    ></div>
                  </div>
                  <span class="text-xs font-medium w-8 text-gray-900 dark:text-white">{{ selectedPokemon.base_stats.attack }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600 dark:text-gray-400">SPA</span>
                <div class="flex items-center gap-2">
                  <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-purple-500 h-2 rounded-full transition-all duration-500 animate-fill-bar"
                      :style="`width: ${(selectedPokemon.base_stats.special_attack / 255) * 100}%`"
                    ></div>
                  </div>
                  <span class="text-xs font-medium w-8 text-gray-900 dark:text-white">{{ selectedPokemon.base_stats.special_attack }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600 dark:text-gray-400">DEF</span>
                <div class="flex items-center gap-2">
                  <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-blue-500 h-2 rounded-full transition-all duration-500 animate-fill-bar"
                      :style="`width: ${(selectedPokemon.base_stats.defense / 255) * 100}%`"
                    ></div>
                  </div>
                  <span class="text-xs font-medium w-8 text-gray-900 dark:text-white">{{ selectedPokemon.base_stats.defense }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600 dark:text-gray-400">SPD</span>
                <div class="flex items-center gap-2">
                  <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-indigo-500 h-2 rounded-full transition-all duration-500 animate-fill-bar"
                      :style="`width: ${(selectedPokemon.base_stats.special_defense / 255) * 100}%`"
                    ></div>
                  </div>
                  <span class="text-xs font-medium w-8 text-gray-900 dark:text-white">{{ selectedPokemon.base_stats.special_defense }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600 dark:text-gray-400">SPE</span>
                <div class="flex items-center gap-2">
                  <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-yellow-500 h-2 rounded-full transition-all duration-500 animate-fill-bar"
                      :style="`width: ${(selectedPokemon.base_stats.speed / 255) * 100}%`"
                    ></div>
                  </div>
                  <span class="text-xs font-medium w-8 text-gray-900 dark:text-white">{{ selectedPokemon.base_stats.speed }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isDark = ref(true);
const isAnimating = ref(false);
const selectedPokemon = ref<Pokemon | null>(null);
const showModal = ref(false);

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

const selectPokemon = (pokemon: Pokemon) => {
  selectedPokemon.value = pokemon;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  setTimeout(() => {
    selectedPokemon.value = null;
  }, 300);
};

// Color mapping for Pokemon types
const typeColors = {
  normal: { light: '#F5F5DC', medium: '#E6E6B8', dark: '#D4D494' },
  fire: { light: '#FFE4E1', medium: '#FFB6C1', dark: '#FF69B4' },
  water: { light: '#E0F6FF', medium: '#87CEEB', dark: '#4682B4' },
  electric: { light: '#FFFACD', medium: '#F0E68C', dark: '#DAA520' },
  grass: { light: '#F0FFF0', medium: '#98FB98', dark: '#32CD32' },
  ice: { light: '#F0FFFF', medium: '#B0E0E6', dark: '#87CEEB' },
  fighting: { light: '#FFE4E1', medium: '#CD5C5C', dark: '#B22222' },
  poison: { light: '#E6E6FA', medium: '#DDA0DD', dark: '#9370DB' },
  ground: { light: '#F5DEB3', medium: '#D2B48C', dark: '#CD853F' },
  flying: { light: '#F0F8FF', medium: '#B0C4DE', dark: '#6495ED' },
  psychic: { light: '#FFE4E1', medium: '#FFB6C1', dark: '#FF1493' },
  bug: { light: '#F5FFFA', medium: '#90EE90', dark: '#228B22' },
  rock: { light: '#F5F5DC', medium: '#D2B48C', dark: '#A0522D' },
  ghost: { light: '#F8F8FF', medium: '#DDA0DD', dark: '#9370DB' },
  dragon: { light: '#E6E6FA', medium: '#9370DB', dark: '#4B0082' },
  dark: { light: '#2F2F2F', medium: '#1C1C1C', dark: '#000000' },
  steel: { light: '#F8F8FF', medium: '#C0C0C0', dark: '#708090' },
  fairy: { light: '#FFF0F5', medium: '#FFB6C1', dark: '#FF69B4' }
};

const getBackgroundStyle = (type: string) => {
  const colors = typeColors[type as keyof typeof typeColors] || typeColors.normal;
  return {
    background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.medium} 50%, ${colors.dark} 100%)`,
    backgroundAttachment: 'fixed'
  };
};

const clearSelection = () => {
  selectedPokemon.value = null;
  showModal.value = false;
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

  if (data.value) {
    const shuffledData = useOrderBy(data.value, key, ordering);
    data.value = shuffledData;
  }
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
  if (data.value) {
    const allTypes = new Set<string>();
    data.value.forEach((pokemon) => {
      pokemon.types.forEach((type) => {
        allTypes.add(type.name);
      });
    });

    // Convert Set to Array and update types
    types.value = Array.from(allTypes);
  }
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

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
  }
}

.pokemon-sprite {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pokemon-sprite:hover {
  animation: float 0.6s ease-in-out infinite;
}

.pokemon-image-container:hover .pokemon-sprite {
  filter: brightness(1.2) contrast(1.1);
}

.pokemon-modal-image img {
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
}

/* Custom type-based colors for better visual appeal */
.bg-gradient-to-br {
  background-attachment: fixed;
}

/* Enhanced hover effects for table rows */
tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Modal entrance animation */
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fixed .bg-white,
.fixed .dark\\:bg-gray-800 {
  animation: modalEnter 0.3s ease-out;
}

/* Stat bar animations */
@keyframes fillBar {
  from {
    width: 0%;
  }
}

.animate-fill-bar {
  animation: fillBar 1s ease-out;
}
</style>
