console.log('=== HOME.JS LOADED ===');

class HomePage {
    constructor() {
        this.baseApiUrl = 'https://pokeapi.co/api/v2';
        this.popularPokemonIds = [25, 1, 4, 7, 150, 448];
        this.pokemonData = [];
        this.init();
    }

    init() {
        console.log('HomePage init() called');
        console.log('Protocol:', window.location.protocol);
        
        // Try API integration for HTTP/HTTPS, fallback for file://
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            console.log('Attempting API integration...');
            this.loadPopularPokemon().catch(() => {
                console.log('API failed, using fallback');
                this.loadFallbackData();
            });
        } else {
            console.log('Using fallback data for file:// protocol');
            this.loadFallbackData();
        }
    }

    async loadPopularPokemon() {
        console.log('Loading Pokemon from API...');
        this.showLoading();
        
        try {
            // Test with just 3 Pokemon first to avoid timeout
            const testIds = [25, 1, 4]; // Pikachu, Bulbasaur, Charmander
            const pokemonPromises = testIds.map(id => this.fetchPokemonData(id));
            
            console.log('Fetching Pokemon:', testIds);
            const pokemonResults = await Promise.allSettled(pokemonPromises);
            console.log('API Results:', pokemonResults);
            
            const successfulResults = pokemonResults.filter(result => result.status === 'fulfilled');
            
            if (successfulResults.length === 0) {
                throw new Error('No successful API calls');
            }
            
            this.pokemonData = successfulResults.map(result => result.value);
            
            // Add fallback data for remaining slots
            const fallbackPokemon = [
                {
                    id: 7, name: 'Squirtle', types: ['Water'],
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
                    stats: { hp: 44, attack: 48 }
                },
                {
                    id: 150, name: 'Mewtwo', types: ['Psychic'],
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
                    stats: { hp: 106, attack: 110 }
                },
                {
                    id: 448, name: 'Lucario', types: ['Fighting', 'Steel'],
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
                    stats: { hp: 70, attack: 110 }
                }
            ];
            
            this.pokemonData = [...this.pokemonData, ...fallbackPokemon];
            
            this.renderPokemonCards();
            this.setupPokemonCards();
            this.hideLoading();
            
            console.log('API integration successful!');
            
        } catch (error) {
            console.error('API Error:', error);
            throw error; // Re-throw to trigger fallback in init()
        }
    }

    async fetchPokemonData(id) {
        try {
            console.log(`Fetching Pokemon ID: ${id}`);
            
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(`${this.baseApiUrl}/pokemon/${id}`, {
                signal: controller.signal,
                method: 'GET',
                mode: 'cors'
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const pokemon = await response.json();
            console.log(`Successfully fetched: ${pokemon.name}`);
            
            return {
                id: pokemon.id,
                name: this.capitalizeFirst(pokemon.name),
                types: pokemon.types.map(type => this.capitalizeFirst(type.type.name)),
                image: pokemon.sprites.other['official-artwork'].front_default || 
                       pokemon.sprites.front_default,
                stats: {
                    hp: pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat,
                    attack: pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat
                }
            };
        } catch (error) {
            console.error(`Error fetching Pokemon ${id}:`, error);
            throw error;
        }
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    loadFallbackData() {
        console.log('Loading fallback data...');
        this.showLoading();
        
        this.pokemonData = [
            {
                id: 25,
                name: 'Pikachu',
                types: ['Electric'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                stats: { hp: 35, attack: 55 }
            },
            {
                id: 1,
                name: 'Bulbasaur',
                types: ['Grass', 'Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
                stats: { hp: 45, attack: 49 }
            },
            {
                id: 4,
                name: 'Charmander',
                types: ['Fire'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
                stats: { hp: 39, attack: 52 }
            },
            {
                id: 7,
                name: 'Squirtle',
                types: ['Water'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
                stats: { hp: 44, attack: 48 }
            },
            {
                id: 150,
                name: 'Mewtwo',
                types: ['Psychic'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
                stats: { hp: 106, attack: 110 }
            },
            {
                id: 448,
                name: 'Lucario',
                types: ['Fighting', 'Steel'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
                stats: { hp: 70, attack: 110 }
            }
        ];
        
        setTimeout(() => {
            this.renderPokemonCards();
            this.setupPokemonCards();
            this.hideLoading();
        }, 1500); // Simulate loading time
    }

    renderPokemonCards() {
        console.log('Rendering Pokemon cards...');
        const grid = document.getElementById('pokemonGrid');
        if (!grid) {
            console.error('pokemonGrid not found!');
            return;
        }

        grid.innerHTML = this.pokemonData.map(pokemon => `
            <div class="pokemon-card" data-pokemon-id="${pokemon.id}">
                <div class="pokemon-card-header">
                    <span class="pokemon-id">#${this.formatPokemonId(pokemon.id)}</span>
                    <div class="pokemon-image">
                        <img src="${pokemon.image}" alt="${pokemon.name}" 
                             onerror="this.src='assets/img/icon/pokemon-placeholder.png'"
                             loading="lazy">
                    </div>
                    <h3 class="pokemon-name">${pokemon.name}</h3>
                    <div class="pokemon-types">
                        ${pokemon.types.map(type => 
                            `<span class="pokemon-type type-${type.toLowerCase()}">${type}</span>`
                        ).join('')}
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
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('Pokemon cards rendered successfully!');
    }

    showLoading() {
        const loading = document.getElementById('pokemonLoading');
        const grid = document.getElementById('pokemonGrid');
        const error = document.getElementById('pokemonError');
        
        if (loading) loading.style.display = 'block';
        if (grid) grid.style.display = 'none';
        if (error) error.style.display = 'none';
    }

    hideLoading() {
        const loading = document.getElementById('pokemonLoading');
        const grid = document.getElementById('pokemonGrid');
        
        if (loading) loading.style.display = 'none';
        if (grid) grid.style.display = 'grid';
    }

    setupPokemonCards() {
        setTimeout(() => {
            document.querySelectorAll('.pokemon-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    console.log('Card clicked:', card.dataset.pokemonId);
                    const pokemonId = card.getAttribute('data-pokemon-id');
                    window.location.href = `detailpokemon.html?id=${pokemonId}`;
                });
            });
        }, 100);
    }

    formatPokemonId(id) {
        return id.toString().padStart(3, '0');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting Pokemon Gallery...');
    
    const pokemonGrid = document.getElementById('pokemonGrid');
    if (!pokemonGrid) {
        console.error('pokemonGrid element not found!');
        return;
    }
    
    window.homePage = new HomePage();
    console.log('HomePage initialized successfully');
});
