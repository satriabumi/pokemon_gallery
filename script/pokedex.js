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
        this.maxPokemonCount = 151; // Generation 1 Pokemon
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
            this.loadPokemonFromAPI().catch(() => {
                console.log('API failed, using fallback data');
                this.loadFallbackData();
            });
        } else {
            console.log('Using fallback data for file:// protocol');
            this.loadFallbackData();
        }
    }

    async loadPokemonFromAPI() {
        console.log('Loading Pokemon from PokeAPI...');
        this.showLoading();
        
        try {
            // Load first batch of Pokemon (1-30 for initial display)
            const pokemonIds = Array.from({length: 30}, (_, i) => i + 1);
            const pokemonPromises = pokemonIds.map(id => this.fetchPokemonData(id));
            
            const pokemonResults = await Promise.allSettled(pokemonPromises);
            const successfulResults = pokemonResults
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            
            if (successfulResults.length === 0) {
                console.error('No successful API calls, using fallback data');
                this.loadFallbackData();
                return;
            }
            
            console.log(`Successfully loaded ${successfulResults.length} Pokemon from API`);
            this.allPokemon = successfulResults.sort((a, b) => a.id - b.id);
            this.filteredPokemon = [...this.allPokemon];
            this.updateStats();
            this.renderPokemon();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading Pokemon from API:', error);
            this.loadFallbackData();
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
        
        // Fallback data for Pokemon (30 Pokemon for better performance)
        // Fallback data for Pokemon (30 Pokemon for better performance)
        this.allPokemon = [
            {
                id: 1,
                name: 'Bulbasaur',
                type: ['Grass', 'Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
                stats: { hp: 45, attack: 49, defense: 49, speed: 45 }
            },
            {
                id: 2,
                name: 'Ivysaur',
                type: ['Grass', 'Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png',
                stats: { hp: 60, attack: 62, defense: 63, speed: 60 }
            },
            {
                id: 3,
                name: 'Venusaur',
                type: ['Grass', 'Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
                stats: { hp: 80, attack: 82, defense: 83, speed: 80 }
            },
            {
                id: 4,
                name: 'Charmander',
                type: ['Fire'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
                stats: { hp: 39, attack: 52, defense: 43, speed: 65 }
            },
            {
                id: 5,
                name: 'Charmeleon',
                type: ['Fire'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png',
                stats: { hp: 58, attack: 64, defense: 58, speed: 80 }
            },
            {
                id: 6,
                name: 'Charizard',
                type: ['Fire', 'Flying'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
                stats: { hp: 78, attack: 84, defense: 78, speed: 100 }
            },
            {
                id: 7,
                name: 'Squirtle',
                type: ['Water'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
                stats: { hp: 44, attack: 48, defense: 65, speed: 43 }
            },
            {
                id: 8,
                name: 'Wartortle',
                type: ['Water'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png',
                stats: { hp: 59, attack: 63, defense: 80, speed: 58 }
            },
            {
                id: 9,
                name: 'Blastoise',
                type: ['Water'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
                stats: { hp: 79, attack: 83, defense: 100, speed: 78 }
            },
            {
                id: 10,
                name: 'Caterpie',
                type: ['Bug'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png',
                stats: { hp: 45, attack: 30, defense: 35, speed: 45 }
            },
            {
                id: 11,
                name: 'Metapod',
                type: ['Bug'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/11.png',
                stats: { hp: 50, attack: 20, defense: 55, speed: 30 }
            },
            {
                id: 12,
                name: 'Butterfree',
                type: ['Bug', 'Flying'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/12.png',
                stats: { hp: 60, attack: 45, defense: 50, speed: 70 }
            },
            {
                id: 13,
                name: 'Weedle',
                type: ['Bug', 'Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/13.png',
                stats: { hp: 40, attack: 35, defense: 30, speed: 50 }
            },
            {
                id: 14,
                name: 'Kakuna',
                type: ['Bug', 'Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/14.png',
                stats: { hp: 45, attack: 25, defense: 50, speed: 35 }
            },
            {
                id: 15,
                name: 'Beedrill',
                type: ['Bug', 'Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/15.png',
                stats: { hp: 65, attack: 90, defense: 40, speed: 75 }
            },
            {
                id: 16,
                name: 'Pidgey',
                type: ['Normal', 'Flying'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png',
                stats: { hp: 40, attack: 45, defense: 40, speed: 56 }
            },
            {
                id: 17,
                name: 'Pidgeotto',
                type: ['Normal', 'Flying'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/17.png',
                stats: { hp: 63, attack: 60, defense: 55, speed: 71 }
            },
            {
                id: 18,
                name: 'Pidgeot',
                type: ['Normal', 'Flying'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png',
                stats: { hp: 83, attack: 80, defense: 75, speed: 101 }
            },
            {
                id: 19,
                name: 'Rattata',
                type: ['Normal'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png',
                stats: { hp: 30, attack: 56, defense: 35, speed: 72 }
            },
            {
                id: 20,
                name: 'Raticate',
                type: ['Normal'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/20.png',
                stats: { hp: 55, attack: 81, defense: 60, speed: 97 }
            },
            {
                id: 21,
                name: 'Spearow',
                type: ['Normal', 'Flying'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/21.png',
                stats: { hp: 40, attack: 60, defense: 30, speed: 70 }
            },
            {
                id: 22,
                name: 'Fearow',
                type: ['Normal', 'Flying'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/22.png',
                stats: { hp: 65, attack: 90, defense: 65, speed: 100 }
            },
            {
                id: 23,
                name: 'Ekans',
                type: ['Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/23.png',
                stats: { hp: 35, attack: 60, defense: 44, speed: 55 }
            },
            {
                id: 24,
                name: 'Arbok',
                type: ['Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/24.png',
                stats: { hp: 60, attack: 95, defense: 69, speed: 80 }
            },
            {
                id: 25,
                name: 'Pikachu',
                type: ['Electric'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                stats: { hp: 35, attack: 55, defense: 40, speed: 90 }
            },
            {
                id: 26,
                name: 'Raichu',
                type: ['Electric'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png',
                stats: { hp: 60, attack: 90, defense: 55, speed: 110 }
            },
            {
                id: 27,
                name: 'Sandshrew',
                type: ['Ground'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/27.png',
                stats: { hp: 50, attack: 75, defense: 85, speed: 40 }
            },
            {
                id: 28,
                name: 'Sandslash',
                type: ['Ground'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/28.png',
                stats: { hp: 75, attack: 100, defense: 110, speed: 65 }
            },
            {
                id: 29,
                name: 'Nidoran♀',
                type: ['Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/29.png',
                stats: { hp: 55, attack: 47, defense: 52, speed: 41 }
            },
            {
                id: 30,
                name: 'Nidorina',
                type: ['Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/30.png',
                stats: { hp: 70, attack: 62, defense: 67, speed: 56 }
            }
        ];

        setTimeout(() => {
            this.filteredPokemon = [...this.allPokemon];
            this.updateStats();
            this.renderPokemon();
            this.hideLoading();
        }, 1000);
    }

    showLoading() {
        const loading = document.getElementById('loading');
        const pokemonGrid = document.getElementById('pokemon-grid');
        const loadMoreContainer = document.getElementById('load-more-container');
        
        if (loading) loading.style.display = 'block';
        if (pokemonGrid) pokemonGrid.innerHTML = '';
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        this.isLoading = true;
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
        this.isLoading = false;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.filterPokemon();
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                this.currentFilter = e.target.dataset.type;
                this.currentPage = 1;
                this.filterPokemon();
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMorePokemon();
            });
        }
    }

    setupInfiniteScroll() {
        // Infinite scroll functionality
        window.addEventListener('scroll', () => {
            if (this.isNearBottom()) {
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
        this.filteredPokemon = this.allPokemon.filter(pokemon => {
            const matchesSearch = pokemon.name.toLowerCase().includes(this.currentSearch) ||
                                pokemon.type.some(type => type.toLowerCase().includes(this.currentSearch));
            
            const matchesFilter = this.currentFilter === 'all' || 
                                pokemon.type.some(type => type.toLowerCase() === this.currentFilter.toLowerCase());
            
            return matchesSearch && matchesFilter;
        });

        this.currentPage = 1;
        this.updateStats();
        this.renderPokemon();
    }

    updateStats() {
        const totalPokemon = document.getElementById('total-pokemon');
        const shownPokemon = document.getElementById('shown-pokemon');
        
        if (totalPokemon) {
            // Show current loaded count vs maximum available
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
        const noResults = document.getElementById('no-results');
        const loadMoreContainer = document.getElementById('load-more-container');
        
        if (!pokemonGrid) return;

        // Clear existing content
        pokemonGrid.innerHTML = '';

        if (this.filteredPokemon.length === 0) {
            if (noResults) noResults.style.display = 'block';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }

        if (noResults) noResults.style.display = 'none';

        // Calculate pagination
        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const pokemonToShow = this.filteredPokemon.slice(startIndex, endIndex);

        // Create Pokemon cards
        pokemonToShow.forEach(pokemon => {
            const card = this.createPokemonCard(pokemon);
            pokemonGrid.appendChild(card);
        });

        // Show/hide load more button
        if (loadMoreContainer) {
            loadMoreContainer.style.display = endIndex < this.filteredPokemon.length ? 'block' : 'none';
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

        // Add click event
        card.addEventListener('click', () => {
            window.location.href = `detailpokemon.html?id=${pokemon.id}`;
        });

        return card;
    }

    loadMorePokemon() {
        if (this.currentPage * this.itemsPerPage >= this.filteredPokemon.length) {
            // If we've shown all filtered Pokemon, try to load more from API
            this.loadMoreFromAPI();
            return;
        }

        this.currentPage++;
        this.renderPokemon();
    }

    async loadMoreFromAPI() {
        if (this.isLoading) return;
        
        const currentMaxId = Math.max(...this.allPokemon.map(p => p.id));
        if (currentMaxId >= this.maxPokemonCount) {
            // Hide load more button if we've reached the maximum
            const loadMoreContainer = document.getElementById('load-more-container');
            if (loadMoreContainer) {
                loadMoreContainer.style.display = 'none';
            }
            return;
        }

        console.log('Loading more Pokemon from API...');
        this.isLoading = true;
        
        // Show loading state
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Memuat...';
            loadMoreBtn.disabled = true;
        }
        
        try {
            // Load next batch of Pokemon (10 more)
            const startId = currentMaxId + 1;
            const endId = Math.min(startId + 9, this.maxPokemonCount);
            const pokemonIds = Array.from({length: endId - startId + 1}, (_, i) => startId + i);
            
            const pokemonPromises = pokemonIds.map(id => this.fetchPokemonData(id));
            const pokemonResults = await Promise.allSettled(pokemonPromises);
            
            const successfulResults = pokemonResults
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            
            if (successfulResults.length > 0) {
                this.allPokemon.push(...successfulResults);
                this.allPokemon.sort((a, b) => a.id - b.id);
                
                console.log(`Added ${successfulResults.length} more Pokemon`);
                
                // Re-apply current filter
                this.filterPokemon();
            }
            
        } catch (error) {
            console.error('Error loading more Pokemon from API:', error);
            
            // Show error message
            const loadMoreBtn = document.getElementById('load-more-btn');
            if (loadMoreBtn) {
                loadMoreBtn.textContent = 'Error - Coba Lagi';
            }
        } finally {
            this.isLoading = false;
            
            // Reset load more button
            const loadMoreBtn = document.getElementById('load-more-btn');
            if (loadMoreBtn) {
                loadMoreBtn.textContent = 'Muat Lebih Banyak';
                loadMoreBtn.disabled = false;
            }
        }
    }

    formatNumber(num) {
        return num.toString().padStart(3, '0');
    }

    // Utility function to get type color
    getTypeColor(type) {
        const typeColors = {
            'normal': '#A8A878',
            'fire': '#F08030',
            'water': '#6890F0',
            'electric': '#F8D030',
            'grass': '#78C850',
            'ice': '#98D8D8',
            'fighting': '#C03028',
            'poison': '#A040A0',
            'ground': '#E0C068',
            'flying': '#A890F0',
            'psychic': '#F85888',
            'bug': '#A8B820',
            'rock': '#B8A038',
            'ghost': '#705898',
            'dragon': '#7038F8',
            'dark': '#705848',
            'steel': '#B8B8D0',
            'fairy': '#EE99AC'
        };
        
        return typeColors[type.toLowerCase()] || '#A8A878';
    }
}

// Initialize Pokédex page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pokedexPage = new PokedexPage();
});

// Add CSS for enhanced animations
const style = document.createElement('style');
style.textContent = `
    .pokemon-card {
        animation: fadeInUp 0.6s ease-out;
        animation-fill-mode: both;
    }

    .pokemon-card:nth-child(1) { animation-delay: 0.1s; }
    .pokemon-card:nth-child(2) { animation-delay: 0.2s; }
    .pokemon-card:nth-child(3) { animation-delay: 0.3s; }
    .pokemon-card:nth-child(4) { animation-delay: 0.4s; }
    .pokemon-card:nth-child(5) { animation-delay: 0.5s; }
    .pokemon-card:nth-child(6) { animation-delay: 0.6s; }
    .pokemon-card:nth-child(7) { animation-delay: 0.7s; }
    .pokemon-card:nth-child(8) { animation-delay: 0.8s; }
    .pokemon-card:nth-child(9) { animation-delay: 0.9s; }
    .pokemon-card:nth-child(10) { animation-delay: 1.0s; }
    .pokemon-card:nth-child(11) { animation-delay: 1.1s; }
    .pokemon-card:nth-child(12) { animation-delay: 1.2s; }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .pokemon-card:hover {
        transform: translateY(-8px) scale(1.02);
    }

    .filter-btn {
        position: relative;
        overflow: hidden;
    }

    .filter-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }

    .filter-btn:hover::before {
        left: 100%;
    }

    .search-input:focus {
        transform: scale(1.02);
    }

    .pokemon-image img {
        transition: transform 0.3s ease;
    }

    .pokemon-card:hover .pokemon-image img {
        transform: scale(1.1) rotate(5deg);
    }
`;
document.head.appendChild(style);
