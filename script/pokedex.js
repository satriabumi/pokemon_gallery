// Pokédex Page JavaScript with PokeAPI Integration
class PokedexPage {
    constructor() {
        this.baseApiUrl = 'https://pokeapi.co/api/v2';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.allPokemon = [];
        this.filteredPokemon = [];
        this.isLoading = false;
        // Ubah maxPokemonCount menjadi 251 untuk menyertakan Generasi II
        this.maxPokemonCount = 251; // Generation 1 & 2 Pokemon
        this.init();
    }

    init() {
        console.log('PokedexPage init() called');
        console.log('Protocol:', window.location.protocol);
        
        this.setupEventListeners();
        this.setupInfiniteScroll();
        
        // Try API integration for HTTP/HTTPS, fallback for file://
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            console.log('Attempting API integration for Pokedex...');
            // Ubah ini untuk memuat semua 151 Pokemon sekaligus jika memungkinkan
            // Ini akan menyederhanakan logika filter dan "no results"
            this.loadAllPokemonFromAPI().catch(() => {
                console.log('API failed or incomplete, using fallback data');
                this.loadFallbackData();
            });
        } else {
            console.log('Using fallback data for file:// protocol');
            this.loadFallbackData();
        }
    }

    // Fungsi baru untuk memuat semua Pokemon hingga maxPokemonCount
    async loadAllPokemonFromAPI() {
        console.log(`Loading all ${this.maxPokemonCount} Pokemon from PokeAPI...`);
        this.showLoading();
        
        try {
            const pokemonPromises = [];
            for (let i = 1; i <= this.maxPokemonCount; i++) {
                pokemonPromises.push(this.fetchPokemonData(i));
            }
            
            const pokemonResults = await Promise.allSettled(pokemonPromises);
            const successfulResults = pokemonResults
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            
            if (successfulResults.length === 0) {
                throw new Error('No successful API calls for initial load');
            }
            
            console.log(`Successfully loaded ${successfulResults.length} Pokemon from API`);
            this.allPokemon = successfulResults.sort((a, b) => a.id - b.id);
            this.filteredPokemon = [...this.allPokemon];
            this.updateStats();
            this.renderPokemon();
            this.hideLoading();
            this.setFilterButtonsState(true);
            
        } catch (error) {
            console.error('Error loading all Pokemon from API:', error);
            throw error; // Lempar error untuk ditangkap oleh .catch di init()
        }
    }

    async fetchPokemonData(id) {
        try {
            const response = await fetch(`${this.baseApiUrl}/pokemon/${id}`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const pokemon = await response.json();
            
            return {
                id: pokemon.id,
                name: this.capitalizeFirst(pokemon.name),
                type: pokemon.types.map(type => this.capitalizeFirst(type.type.name)),
                image: pokemon.sprites.other['official-artwork'].front_default || 
                       pokemon.sprites.front_default ||
                       'assets/img/icon/pokemon-placeholder.png',
                stats: {
                    hp: pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat,
                    attack: pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat,
                    defense: pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat,
                    speed: pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat
                }
            };
        } catch (error) {
            console.error(`Error fetching Pokemon ${id}:`, error);
            throw error;
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    loadFallbackData() {
        console.log('Loading fallback Pokemon data...');
        this.showLoading();
        
        this.setFilterButtonsState(false);
        this.allPokemon = [
            { id: 1, name: 'Bulbasaur', type: ['Grass', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', stats: { hp: 45, attack: 49, defense: 49, speed: 45 } },
            { id: 2, name: 'Ivysaur', type: ['Grass', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png', stats: { hp: 60, attack: 62, defense: 63, speed: 60 } },
            { id: 3, name: 'Venusaur', type: ['Grass', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png', stats: { hp: 80, attack: 82, defense: 83, speed: 80 } },
            { id: 4, name: 'Charmander', type: ['Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', stats: { hp: 39, attack: 52, defense: 43, speed: 65 } },
            { id: 5, name: 'Charmeleon', type: ['Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png', stats: { hp: 58, attack: 64, defense: 58, speed: 80 } },
            { id: 6, name: 'Charizard', type: ['Fire', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', stats: { hp: 78, attack: 84, defense: 78, speed: 100 } },
            { id: 7, name: 'Squirtle', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', stats: { hp: 44, attack: 48, defense: 65, speed: 43 } },
            { id: 8, name: 'Wartortle', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png', stats: { hp: 59, attack: 63, defense: 80, speed: 58 } },
            { id: 9, name: 'Blastoise', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png', stats: { hp: 79, attack: 83, defense: 100, speed: 78 } },
            { id: 10, name: 'Caterpie', type: ['Bug'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png', stats: { hp: 45, attack: 30, defense: 35, speed: 45 } },
            { id: 11, name: 'Metapod', type: ['Bug'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/11.png', stats: { hp: 50, attack: 20, defense: 55, speed: 30 } },
            { id: 12, name: 'Butterfree', type: ['Bug', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/12.png', stats: { hp: 60, attack: 45, defense: 50, speed: 70 } },
            { id: 13, name: 'Weedle', type: ['Bug', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/13.png', stats: { hp: 40, attack: 35, defense: 30, speed: 50 } },
            { id: 14, name: 'Kakuna', type: ['Bug', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/14.png', stats: { hp: 45, attack: 25, defense: 50, speed: 35 } },
            { id: 15, name: 'Beedrill', type: ['Bug', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/15.png', stats: { hp: 65, attack: 90, defense: 40, speed: 75 } },
            { id: 16, name: 'Pidgey', type: ['Normal', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png', stats: { hp: 40, attack: 45, defense: 40, speed: 56 } },
            { id: 17, name: 'Pidgeotto', type: ['Normal', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/17.png', stats: { hp: 63, attack: 60, defense: 55, speed: 71 } },
            { id: 18, name: 'Pidgeot', type: ['Normal', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png', stats: { hp: 83, attack: 80, defense: 75, speed: 101 } },
            { id: 19, name: 'Rattata', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png', stats: { hp: 30, attack: 56, defense: 35, speed: 72 } },
            { id: 20, name: 'Raticate', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/20.png', stats: { hp: 55, attack: 81, defense: 60, speed: 97 } },
            { id: 21, name: 'Spearow', type: ['Normal', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/21.png', stats: { hp: 40, attack: 60, defense: 30, speed: 70 } },
            { id: 22, name: 'Fearow', type: ['Normal', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/22.png', stats: { hp: 65, attack: 90, defense: 65, speed: 100 } },
            { id: 23, name: 'Ekans', type: ['Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/23.png', stats: { hp: 35, attack: 60, defense: 44, speed: 55 } },
            { id: 24, name: 'Arbok', type: ['Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/24.png', stats: { hp: 60, attack: 95, defense: 69, speed: 80 } },
            { id: 25, name: 'Pikachu', type: ['Electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', stats: { hp: 35, attack: 55, defense: 40, speed: 90 } },
            { id: 26, name: 'Raichu', type: ['Electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png', stats: { hp: 60, attack: 90, defense: 55, speed: 110 } },
            { id: 27, name: 'Sandshrew', type: ['Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/27.png', stats: { hp: 50, attack: 75, defense: 85, speed: 40 } },
            { id: 28, name: 'Sandslash', type: ['Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/28.png', stats: { hp: 75, attack: 100, defense: 110, speed: 65 } },
            { id: 29, name: 'Nidoran♀', type: ['Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/29.png', stats: { hp: 55, attack: 47, defense: 52, speed: 41 } },
            { id: 30, name: 'Nidorina', type: ['Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/30.png', stats: { hp: 70, attack: 62, defense: 67, speed: 56 } },
            { id: 31, name: 'Nidoqueen', type: ['Poison', 'Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/31.png', stats: { hp: 90, attack: 92, defense: 87, speed: 76 } },
            { id: 32, name: 'Nidoran♂', type: ['Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/32.png', stats: { hp: 46, attack: 57, defense: 40, speed: 50 } },
            { id: 33, name: 'Nidorino', type: ['Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/33.png', stats: { hp: 61, attack: 72, defense: 57, speed: 65 } },
            { id: 34, name: 'Nidoking', type: ['Poison', 'Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/34.png', stats: { hp: 81, attack: 102, defense: 77, speed: 85 } },
            { id: 35, name: 'Clefairy', type: ['Fairy'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/35.png', stats: { hp: 70, attack: 45, defense: 48, speed: 35 } },
            { id: 36, name: 'Clefable', type: ['Fairy'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/36.png', stats: { hp: 95, attack: 70, defense: 73, speed: 60 } },
            { id: 37, name: 'Vulpix', type: ['Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png', stats: { hp: 38, attack: 41, defense: 40, speed: 65 } },
            { id: 38, name: 'Ninetales', type: ['Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png', stats: { hp: 73, attack: 76, defense: 75, speed: 100 } },
            { id: 39, name: 'Jigglypuff', type: ['Normal', 'Fairy'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png', stats: { hp: 115, attack: 45, defense: 20, speed: 20 } },
            { id: 40, name: 'Wigglytuff', type: ['Normal', 'Fairy'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/40.png', stats: { hp: 140, attack: 70, defense: 45, speed: 45 } },
            { id: 41, name: 'Zubat', type: ['Poison', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/41.png', stats: { hp: 40, attack: 45, defense: 35, speed: 55 } },
            { id: 42, name: 'Golbat', type: ['Poison', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/42.png', stats: { hp: 75, attack: 80, defense: 70, speed: 90 } },
            { id: 43, name: 'Oddish', type: ['Grass', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/43.png', stats: { hp: 45, attack: 50, defense: 55, speed: 30 } },
            { id: 44, name: 'Gloom', type: ['Grass', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/44.png', stats: { hp: 60, attack: 65, defense: 70, speed: 40 } },
            { id: 45, name: 'Vileplume', type: ['Grass', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/45.png', stats: { hp: 75, attack: 80, defense: 85, speed: 50 } },
            { id: 46, name: 'Paras', type: ['Bug', 'Grass'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/46.png', stats: { hp: 35, attack: 70, defense: 55, speed: 25 } },
            { id: 47, name: 'Parasect', type: ['Bug', 'Grass'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/47.png', stats: { hp: 60, attack: 95, defense: 80, speed: 30 } },
            { id: 48, name: 'Venonat', type: ['Bug', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/48.png', stats: { hp: 60, attack: 55, defense: 50, speed: 45 } },
            { id: 49, name: 'Venomoth', type: ['Bug', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/49.png', stats: { hp: 70, attack: 65, defense: 60, speed: 90 } },
            { id: 50, name: 'Diglett', type: ['Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/50.png', stats: { hp: 10, attack: 55, defense: 25, speed: 95 } },
            { id: 51, name: 'Dugtrio', type: ['Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/51.png', stats: { hp: 35, attack: 100, defense: 50, speed: 120 } },
            { id: 52, name: 'Meowth', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png', stats: { hp: 40, attack: 45, defense: 35, speed: 90 } },
            { id: 53, name: 'Persian', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/53.png', stats: { hp: 65, attack: 70, defense: 60, speed: 115 } },
            { id: 54, name: 'Psyduck', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png', stats: { hp: 50, attack: 52, defense: 48, speed: 55 } },
            { id: 55, name: 'Golduck', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/55.png', stats: { hp: 80, attack: 82, defense: 78, speed: 85 } },
            { id: 56, name: 'Mankey', type: ['Fighting'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/56.png', stats: { hp: 40, attack: 80, defense: 35, speed: 70 } },
            { id: 57, name: 'Primeape', type: ['Fighting'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/57.png', stats: { hp: 65, attack: 105, defense: 60, speed: 95 } },
            { id: 58, name: 'Growlithe', type: ['Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png', stats: { hp: 55, attack: 70, defense: 45, speed: 60 } },
            { id: 59, name: 'Arcanine', type: ['Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png', stats: { hp: 90, attack: 110, defense: 80, speed: 95 } },
            { id: 60, name: 'Poliwag', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/60.png', stats: { hp: 40, attack: 50, defense: 40, speed: 90 } },
            { id: 61, name: 'Poliwhirl', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/61.png', stats: { hp: 65, attack: 65, defense: 65, speed: 90 } },
            { id: 62, name: 'Poliwrath', type: ['Water', 'Fighting'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/62.png', stats: { hp: 90, attack: 95, defense: 95, speed: 70 } },
            { id: 63, name: 'Abra', type: ['Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png', stats: { hp: 25, attack: 20, defense: 15, speed: 90 } },
            { id: 64, name: 'Kadabra', type: ['Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/64.png', stats: { hp: 40, attack: 35, defense: 30, speed: 105 } },
            { id: 65, name: 'Alakazam', type: ['Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png', stats: { hp: 55, attack: 50, defense: 45, speed: 120 } },
            { id: 66, name: 'Machop', type: ['Fighting'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/66.png', stats: { hp: 70, attack: 80, defense: 50, speed: 35 } },
            { id: 67, name: 'Machoke', type: ['Fighting'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/67.png', stats: { hp: 80, attack: 100, defense: 70, speed: 45 } },
            { id: 68, name: 'Machamp', type: ['Fighting'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png', stats: { hp: 90, attack: 130, defense: 80, speed: 55 } },
            { id: 69, name: 'Bellsprout', type: ['Grass', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/69.png', stats: { hp: 50, attack: 75, defense: 35, speed: 40 } },
            { id: 70, name: 'Weepinbell', type: ['Grass', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/70.png', stats: { hp: 65, attack: 90, defense: 50, speed: 55 } },
            { id: 71, name: 'Victreebel', type: ['Grass', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/71.png', stats: { hp: 80, attack: 105, defense: 65, speed: 70 } },
            { id: 72, name: 'Tentacool', type: ['Water', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/72.png', stats: { hp: 40, attack: 40, defense: 35, speed: 70 } },
            { id: 73, name: 'Tentacruel', type: ['Water', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/73.png', stats: { hp: 80, attack: 70, defense: 65, speed: 100 } },
            { id: 74, name: 'Geodude', type: ['Rock', 'Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png', stats: { hp: 40, attack: 80, defense: 100, speed: 20 } },
            { id: 75, name: 'Graveler', type: ['Rock', 'Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/75.png', stats: { hp: 55, attack: 95, defense: 115, speed: 35 } },
            { id: 76, name: 'Golem', type: ['Rock', 'Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/76.png', stats: { hp: 80, attack: 120, defense: 130, speed: 45 } },
            { id: 77, name: 'Ponyta', type: ['Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/77.png', stats: { hp: 50, attack: 85, defense: 55, speed: 90 } },
            { id: 78, name: 'Rapidash', type: ['Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/78.png', stats: { hp: 65, attack: 100, defense: 70, speed: 105 } },
            { id: 79, name: 'Slowpoke', type: ['Water', 'Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/79.png', stats: { hp: 90, attack: 65, defense: 65, speed: 15 } },
            { id: 80, name: 'Slowbro', type: ['Water', 'Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/80.png', stats: { hp: 95, attack: 75, defense: 110, speed: 30 } },
            { id: 81, name: 'Magnemite', type: ['Electric', 'Steel'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/81.png', stats: { hp: 25, attack: 35, defense: 70, speed: 45 } },
            { id: 82, name: 'Magneton', type: ['Electric', 'Steel'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/82.png', stats: { hp: 50, attack: 60, defense: 95, speed: 70 } },
            { id: 83, name: 'Farfetch\'d', type: ['Normal', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/83.png', stats: { hp: 52, attack: 90, defense: 55, speed: 60 } },
            { id: 84, name: 'Doduo', type: ['Normal', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/84.png', stats: { hp: 35, attack: 85, defense: 45, speed: 75 } },
            { id: 85, name: 'Dodrio', type: ['Normal', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/85.png', stats: { hp: 60, attack: 110, defense: 70, speed: 100 } },
            { id: 86, name: 'Seel', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/86.png', stats: { hp: 65, attack: 45, defense: 55, speed: 45 } },
            { id: 87, name: 'Dewgong', type: ['Water', 'Ice'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png', stats: { hp: 90, attack: 70, defense: 80, speed: 70 } },
            { id: 88, name: 'Grimer', type: ['Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/88.png', stats: { hp: 80, attack: 80, defense: 50, speed: 25 } },
            { id: 89, name: 'Muk', type: ['Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/89.png', stats: { hp: 105, attack: 105, defense: 75, speed: 50 } },
            { id: 90, name: 'Shellder', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/90.png', stats: { hp: 30, attack: 65, defense: 100, speed: 40 } },
            { id: 91, name: 'Cloyster', type: ['Water', 'Ice'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/91.png', stats: { hp: 50, attack: 95, defense: 180, speed: 70 } },
            { id: 92, name: 'Gastly', type: ['Ghost', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png', stats: { hp: 30, attack: 35, defense: 30, speed: 80 } },
            { id: 93, name: 'Haunter', type: ['Ghost', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/93.png', stats: { hp: 45, attack: 50, defense: 45, speed: 95 } },
            { id: 94, name: 'Gengar', type: ['Ghost', 'Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png', stats: { hp: 60, attack: 65, defense: 60, speed: 110 } },
            { id: 95, name: 'Onix', type: ['Rock', 'Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png', stats: { hp: 35, attack: 45, defense: 160, speed: 70 } },
            { id: 96, name: 'Drowzee', type: ['Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/96.png', stats: { hp: 60, attack: 48, defense: 45, speed: 42 } },
            { id: 97, name: 'Hypno', type: ['Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/97.png', stats: { hp: 85, attack: 73, defense: 70, speed: 67 } },
            { id: 98, name: 'Krabby', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/98.png', stats: { hp: 30, attack: 105, defense: 90, speed: 50 } },
            { id: 99, name: 'Kingler', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/99.png', stats: { hp: 55, attack: 130, defense: 115, speed: 75 } },
            { id: 100, name: 'Voltorb', type: ['Electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/100.png', stats: { hp: 40, attack: 30, defense: 50, speed: 100 } },
            { id: 101, name: 'Electrode', type: ['Electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/101.png', stats: { hp: 60, attack: 50, defense: 70, speed: 150 } },
            { id: 102, name: 'Exeggcute', type: ['Grass', 'Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/102.png', stats: { hp: 60, attack: 40, defense: 80, speed: 40 } },
            { id: 103, name: 'Exeggutor', type: ['Grass', 'Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/103.png', stats: { hp: 95, attack: 95, defense: 85, speed: 55 } },
            { id: 104, name: 'Cubone', type: ['Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/104.png', stats: { hp: 50, attack: 50, defense: 95, speed: 35 } },
            { id: 105, name: 'Marowak', type: ['Ground'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/105.png', stats: { hp: 60, attack: 80, defense: 110, speed: 45 } },
            { id: 106, name: 'Hitmonlee', type: ['Fighting'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/106.png', stats: { hp: 50, attack: 120, defense: 53, speed: 87 } },
            { id: 107, name: 'Hitmonchan', type: ['Fighting'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/107.png', stats: { hp: 50, attack: 105, defense: 79, speed: 76 } },
            { id: 108, name: 'Lickitung', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/108.png', stats: { hp: 90, attack: 55, defense: 75, speed: 30 } },
            { id: 109, name: 'Koffing', type: ['Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png', stats: { hp: 40, attack: 65, defense: 95, speed: 35 } },
            { id: 110, name: 'Weezing', type: ['Poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/110.png', stats: { hp: 65, attack: 90, defense: 120, speed: 60 } },
            { id: 111, name: 'Rhyhorn', type: ['Ground', 'Rock'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/111.png', stats: { hp: 80, attack: 85, defense: 95, speed: 25 } },
            { id: 112, name: 'Rhydon', type: ['Ground', 'Rock'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/112.png', stats: { hp: 105, attack: 130, defense: 120, speed: 40 } },
            { id: 113, name: 'Chansey', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/113.png', stats: { hp: 250, attack: 5, defense: 5, speed: 50 } },
            { id: 114, name: 'Tangela', type: ['Grass'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/114.png', stats: { hp: 65, attack: 55, defense: 115, speed: 60 } },
            { id: 115, name: 'Kangaskhan', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/115.png', stats: { hp: 105, attack: 95, defense: 80, speed: 90 } },
            { id: 116, name: 'Horsea', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/116.png', stats: { hp: 30, attack: 40, defense: 70, speed: 60 } },
            { id: 117, name: 'Seadra', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/117.png', stats: { hp: 55, attack: 65, defense: 95, speed: 85 } },
            { id: 118, name: 'Goldeen', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/118.png', stats: { hp: 45, attack: 67, defense: 60, speed: 63 } },
            { id: 119, name: 'Seaking', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/119.png', stats: { hp: 80, attack: 92, defense: 65, speed: 68 } },
            { id: 120, name: 'Staryu', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/120.png', stats: { hp: 30, attack: 45, defense: 55, speed: 85 } },
            { id: 121, name: 'Starmie', type: ['Water', 'Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/121.png', stats: { hp: 60, attack: 75, defense: 85, speed: 115 } },
            { id: 122, name: 'Mr. Mime', type: ['Psychic', 'Fairy'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/122.png', stats: { hp: 40, attack: 45, defense: 65, speed: 90 } },
            { id: 123, name: 'Scyther', type: ['Bug', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/123.png', stats: { hp: 70, attack: 110, defense: 80, speed: 105 } },
            { id: 124, name: 'Jynx', type: ['Ice', 'Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/124.png', stats: { hp: 65, attack: 50, defense: 35, speed: 95 } },
            { id: 125, name: 'Electabuzz', type: ['Electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/125.png', stats: { hp: 65, attack: 83, defense: 57, speed: 105 } },
            { id: 126, name: 'Magmar', type: ['Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/126.png', stats: { hp: 65, attack: 95, defense: 57, speed: 93 } },
            { id: 127, name: 'Pinsir', type: ['Bug'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/127.png', stats: { hp: 65, attack: 125, defense: 100, speed: 85 } },
            { id: 128, name: 'Tauros', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/128.png', stats: { hp: 75, attack: 100, defense: 95, speed: 110 } },
            { id: 129, name: 'Magikarp', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png', stats: { hp: 20, attack: 10, defense: 55, speed: 80 } },
            { id: 130, name: 'Gyarados', type: ['Water', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png', stats: { hp: 95, attack: 125, defense: 79, speed: 81 } },
            { id: 131, name: 'Lapras', type: ['Water', 'Ice'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png', stats: { hp: 130, attack: 85, defense: 80, speed: 60 } },
            { id: 132, name: 'Ditto', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png', stats: { hp: 48, attack: 48, defense: 48, speed: 48 } },
            { id: 133, name: 'Eevee', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', stats: { hp: 55, attack: 55, defense: 50, speed: 55 } },
            { id: 134, name: 'Vaporeon', type: ['Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png', stats: { hp: 130, attack: 65, defense: 60, speed: 65 } },
            { id: 135, name: 'Jolteon', type: ['Electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png', stats: { hp: 65, attack: 65, defense: 60, speed: 130 } },
            { id: 136, name: 'Flareon', type: ['Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png', stats: { hp: 65, attack: 130, defense: 60, speed: 65 } },
            { id: 137, name: 'Porygon', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/137.png', stats: { hp: 65, attack: 60, defense: 70, speed: 40 } },
            { id: 138, name: 'Omanyte', type: ['Rock', 'Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/138.png', stats: { hp: 35, attack: 40, defense: 100, speed: 35 } },
            { id: 139, name: 'Omastar', type: ['Rock', 'Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/139.png', stats: { hp: 70, attack: 60, defense: 125, speed: 55 } },
            { id: 140, name: 'Kabuto', type: ['Rock', 'Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/140.png', stats: { hp: 30, attack: 80, defense: 90, speed: 55 } },
            { id: 141, name: 'Kabutops', type: ['Rock', 'Water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/141.png', stats: { hp: 60, attack: 115, defense: 105, speed: 80 } },
            { id: 142, name: 'Aerodactyl', type: ['Rock', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/142.png', stats: { hp: 80, attack: 105, defense: 65, speed: 130 } },
            { id: 143, name: 'Snorlax', type: ['Normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png', stats: { hp: 160, attack: 110, defense: 65, speed: 30 } },
            { id: 144, name: 'Articuno', type: ['Ice', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png', stats: { hp: 90, attack: 85, defense: 100, speed: 85 } },
            { id: 145, name: 'Zapdos', type: ['Electric', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png', stats: { hp: 90, attack: 90, defense: 85, speed: 100 } },
            { id: 146, name: 'Moltres', type: ['Fire', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png', stats: { hp: 90, attack: 100, defense: 90, speed: 90 } },
            { id: 147, name: 'Dratini', type: ['Dragon'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png', stats: { hp: 41, attack: 64, defense: 45, speed: 50 } },
            { id: 148, name: 'Dragonair', type: ['Dragon'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/148.png', stats: { hp: 61, attack: 84, defense: 65, speed: 70 } },
            { id: 149, name: 'Dragonite', type: ['Dragon', 'Flying'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png', stats: { hp: 91, attack: 134, defense: 95, speed: 80 } },
            { id: 150, name: 'Mewtwo', type: ['Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', stats: { hp: 106, attack: 110, defense: 90, speed: 130 } },
            { id: 151, name: 'Mew', type: ['Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png', stats: { hp: 100, attack: 100, defense: 100, speed: 100 } },
            // Menambahkan Pokémon Generasi II yang relevan untuk tipe Dark
            { id: 197, name: 'Umbreon', type: ['Dark'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png', stats: { hp: 95, attack: 65, defense: 110, speed: 65 } },
            { id: 228, name: 'Houndour', type: ['Dark', 'Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/228.png', stats: { hp: 45, attack: 60, defense: 30, speed: 65 } },
            { id: 229, name: 'Houndoom', type: ['Dark', 'Fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/229.png', stats: { hp: 75, attack: 90, defense: 50, speed: 95 } },
            { id: 261, name: 'Poochyena', type: ['Dark'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/261.png', stats: { hp: 35, attack: 55, defense: 35, speed: 35 } },
            { id: 262, name: 'Mightyena', type: ['Dark'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/262.png', stats: { hp: 70, attack: 90, defense: 70, speed: 70 } }
        ];

        setTimeout(() => {
            this.filteredPokemon = [...this.allPokemon];
            this.updateStats();
            this.renderPokemon();
            this.hideLoading();
            this.setFilterButtonsState(true);
        }, 1000);
    }

    showLoading() {
        const loading = document.getElementById('loading');
        const pokemonGrid = document.getElementById('pokemon-grid');
        const loadMoreContainer = document.getElementById('load-more-container');
        const noResultsMessage = document.getElementById('no-results-message');
        
        if (loading) loading.style.display = 'flex';
        if (pokemonGrid) pokemonGrid.innerHTML = '';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        if (noResultsMessage) noResultsMessage.style.display = 'none';
        this.isLoading = true;
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
        this.isLoading = false;
    }

    setFilterButtonsState(enabled) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.disabled = !enabled;
            if (enabled) {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            } else {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            }
        });
    }

    setupEventListeners() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.filterPokemon();
            });
        }

        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Filter button clicked:', e.target.dataset.type);
                
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                this.currentFilter = e.target.dataset.type;
                this.currentPage = 1;
                this.filterPokemon();
            });
        });

        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMorePokemon();
            });
        }
    }

    setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if (this.isNearBottom() && !this.isLoading) {
                this.loadMorePokemon();
            }
        });
    }

    isNearBottom() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        return scrollTop + windowHeight >= documentHeight - 100;
    }

    filterPokemon() {
        if (this.allPokemon.length === 0) {
            console.log('Data not ready yet, skipping filter');
            return;
        }

        console.log('Filter called with:', this.currentFilter);
        console.log('All Pokemon count:', this.allPokemon.length);
        
        this.filteredPokemon = this.allPokemon.filter(pokemon => {
            const matchesSearch = pokemon.name.toLowerCase().includes(this.currentSearch) ||
                                pokemon.type.some(type => type.toLowerCase().includes(this.currentSearch));
            
            const matchesFilter = this.currentFilter === 'all' || 
                                pokemon.type.some(type => type.toLowerCase() === this.currentFilter.toLowerCase());
            
            return matchesSearch && matchesFilter;
        });

        console.log('Filtered Pokemon count:', this.filteredPokemon.length);
        console.log('Current search:', this.currentSearch);

        this.currentPage = 1;
        this.updateStats();
        this.renderPokemon();
    }

    updateStats() {
        const totalPokemon = document.getElementById('total-pokemon');
        const shownPokemon = document.getElementById('shown-pokemon');
        
        if (totalPokemon) {
            const loadedCount = this.allPokemon.length;
            const maxCount = this.maxPokemonCount;
            totalPokemon.textContent = `${loadedCount}/${maxCount}`;
        }
        
        if (shownPokemon) {
            const displayedCount = Math.min(this.currentPage * this.itemsPerPage, this.filteredPokemon.length);
            shownPokemon.textContent = `${displayedCount}/${this.filteredPokemon.length}`;
        }
    }

    renderPokemon() {
        const pokemonGrid = document.getElementById('pokemon-grid');
        const noResultsMessage = document.getElementById('no-results-message');
        const loadMoreContainer = document.getElementById('load-more-container');
        
        if (!pokemonGrid) return;

        pokemonGrid.innerHTML = '';
        
        if (noResultsMessage) noResultsMessage.style.display = 'none';

        // Logika utama untuk menampilkan "no results":
        // Hanya tampilkan jika filteredPokemon kosong DAN semua Pokemon yang mungkin sudah dimuat
        if (this.filteredPokemon.length === 0 && this.allPokemon.length >= this.maxPokemonCount) {
            if (noResultsMessage) noResultsMessage.style.display = 'block';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const pokemonToShow = this.filteredPokemon.slice(startIndex, endIndex);

        pokemonToShow.forEach(pokemon => {
            const card = this.createPokemonCard(pokemon);
            pokemonGrid.appendChild(card);
        });

        if (loadMoreContainer) {
            const allFilteredShown = endIndex >= this.filteredPokemon.length;
            
            if (allFilteredShown) {
                loadMoreContainer.style.display = 'none';
            } else {
                loadMoreContainer.style.display = 'block';
            }
        }

        this.updateStats();
    }

    createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.setAttribute('data-pokemon-id', pokemon.id);
        
        const types = pokemon.type.map(type => 
            `<span class="pokemon-type type-${type.toLowerCase()}">${type}</span>`
        ).join('');

        card.innerHTML = `
            <div class="pokemon-card-header">
                <span class="pokemon-id">#${this.formatNumber(pokemon.id)}</span>
                <div class="pokemon-image">
                    <img src="${pokemon.image}" alt="${pokemon.name}" 
                         onerror="this.src='assets/img/icon/pokemon-placeholder.png'"
                         loading="lazy">
                </div>
                <h3 class="pokemon-name">${pokemon.name}</h3>
                <div class="pokemon-types">
                    ${types}
                </div>
            </div>
            <div class="pokemon-card-body">
                <div class="pokemon-stats">
                    <div class="stat-item">
                        <span class="stat-label">HP</span>
                        <span class="stat-value">${pokemon.stats.hp}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">ATK</span>
                        <span class="stat-value">${pokemon.stats.attack}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">DEF</span>
                        <span class="stat-value">${pokemon.stats.defense}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">SPD</span>
                        <span class="stat-value">${pokemon.stats.speed}</span>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `detailpokemon.html?id=${pokemon.id}`;
        });

        return card;
    }

    loadMorePokemon() {
        if (this.isLoading) return;
        
        if (this.currentPage * this.itemsPerPage < this.filteredPokemon.length) {
            this.currentPage++;
            this.renderPokemon();
        } else {
            console.log('All filtered Pokemon are already displayed.');
            const loadMoreContainer = document.getElementById('load-more-container');
            if (loadMoreContainer) {
                loadMoreContainer.style.display = 'none';
            }
        }
    }

    formatNumber(num) {
        return num.toString().padStart(3, '0');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.pokedexPage = new PokedexPage();
});