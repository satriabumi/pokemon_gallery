// Main JavaScript for Pokemon Gallery Website
class PokemonGallery {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSearch();
        this.setupFilters();
        this.loadMockData();
    }

    setupNavigation() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
        }
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target.dataset.type);
            });
        });
    }

    handleSearch(query) {
        const pokemonCards = document.querySelectorAll('.pokemon-card');
        const searchTerm = query.toLowerCase();

        pokemonCards.forEach(card => {
            const pokemonName = card.querySelector('.pokemon-name').textContent.toLowerCase();
            const pokemonType = card.querySelector('.pokemon-type').textContent.toLowerCase();
            
            if (pokemonName.includes(searchTerm) || pokemonType.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    handleFilter(type) {
        const pokemonCards = document.querySelectorAll('.pokemon-card');
        
        if (type === 'all') {
            pokemonCards.forEach(card => card.style.display = 'block');
            return;
        }

        pokemonCards.forEach(card => {
            const pokemonType = card.querySelector('.pokemon-type').textContent.toLowerCase();
            if (pokemonType.includes(type.toLowerCase())) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    loadMockData() {
        // Mock data for Pokemon
        this.pokemonData = [
            {
                id: 1,
                name: 'Bulbasaur',
                type: 'Grass/Poison',
                image: 'assets/img/pokemon/bulbasaur.png',
                height: '0.7m',
                weight: '6.9kg',
                abilities: ['Overgrow', 'Chlorophyll'],
                stats: { hp: 45, attack: 49, defense: 49, speed: 45 },
                evolution: ['Bulbasaur', 'Ivysaur', 'Venusaur']
            },
            {
                id: 4,
                name: 'Charmander',
                type: 'Fire',
                image: 'assets/img/pokemon/charmander.png',
                height: '0.6m',
                weight: '8.5kg',
                abilities: ['Blaze', 'Solar Power'],
                stats: { hp: 39, attack: 52, defense: 43, speed: 65 },
                evolution: ['Charmander', 'Charmeleon', 'Charizard']
            },
            {
                id: 7,
                name: 'Squirtle',
                type: 'Water',
                image: 'assets/img/pokemon/squirtle.png',
                height: '0.5m',
                weight: '9.0kg',
                abilities: ['Torrent', 'Rain Dish'],
                stats: { hp: 44, attack: 48, defense: 65, speed: 43 },
                evolution: ['Squirtle', 'Wartortle', 'Blastoise']
            }
        ];

        // Mock data for Pokemon types
        this.typeData = [
            { name: 'Normal', color: '#A8A878', weaknesses: ['Fighting'], resistances: [], immunities: ['Ghost'] },
            { name: 'Fire', color: '#F08030', weaknesses: ['Water', 'Ground', 'Rock'], resistances: ['Fire', 'Grass', 'Ice', 'Bug', 'Steel', 'Fairy'], immunities: [] },
            { name: 'Water', color: '#6890F0', weaknesses: ['Electric', 'Grass'], resistances: ['Fire', 'Water', 'Ice', 'Steel'], immunities: [] },
            { name: 'Electric', color: '#F8D030', weaknesses: ['Ground'], resistances: ['Electric', 'Flying', 'Steel'], immunities: [] },
            { name: 'Grass', color: '#78C850', weaknesses: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'], resistances: ['Water', 'Electric', 'Grass', 'Ground'], immunities: [] },
            { name: 'Ice', color: '#98D8D8', weaknesses: ['Fire', 'Fighting', 'Rock', 'Steel'], resistances: ['Ice'], immunities: [] },
            { name: 'Fighting', color: '#C03028', weaknesses: ['Flying', 'Psychic', 'Fairy'], resistances: ['Bug', 'Rock', 'Dark'], immunities: [] },
            { name: 'Poison', color: '#A040A0', weaknesses: ['Ground', 'Psychic'], resistances: ['Grass', 'Fighting', 'Poison', 'Bug', 'Fairy'], immunities: [] },
            { name: 'Ground', color: '#E0C068', weaknesses: ['Water', 'Grass', 'Ice'], resistances: ['Poison', 'Rock'], immunities: ['Electric'] },
            { name: 'Flying', color: '#A890F0', weaknesses: ['Electric', 'Ice', 'Rock'], resistances: ['Grass', 'Fighting', 'Bug'], immunities: ['Ground'] },
            { name: 'Psychic', color: '#F85888', weaknesses: ['Bug', 'Ghost', 'Dark'], resistances: ['Fighting', 'Psychic'], immunities: [] },
            { name: 'Bug', color: '#A8B820', weaknesses: ['Fire', 'Flying', 'Rock'], resistances: ['Grass', 'Fighting', 'Ground'], immunities: [] },
            { name: 'Rock', color: '#B8A038', weaknesses: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'], resistances: ['Normal', 'Fire', 'Poison', 'Flying'], immunities: [] },
            { name: 'Ghost', color: '#705898', weaknesses: ['Ghost', 'Dark'], resistances: ['Poison', 'Bug'], immunities: ['Normal', 'Fighting'] },
            { name: 'Dragon', color: '#7038F8', weaknesses: ['Ice', 'Dragon', 'Fairy'], resistances: ['Fire', 'Water', 'Electric', 'Grass'], immunities: [] },
            { name: 'Dark', color: '#705848', weaknesses: ['Fighting', 'Bug', 'Fairy'], resistances: ['Ghost', 'Dark'], immunities: ['Psychic'] },
            { name: 'Steel', color: '#B8B8D0', weaknesses: ['Fire', 'Fighting', 'Ground'], resistances: ['Normal', 'Grass', 'Ice', 'Flying', 'Psychic', 'Bug', 'Rock', 'Dragon', 'Steel', 'Fairy'], immunities: ['Poison'] },
            { name: 'Fairy', color: '#EE99AC', weaknesses: ['Poison', 'Steel'], resistances: ['Fighting', 'Bug', 'Dark'], immunities: ['Dragon'] }
        ];

        // Mock data for moves
        this.movesData = [
            { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, category: 'Physical' },
            { name: 'Ember', type: 'Fire', power: 40, accuracy: 100, category: 'Special' },
            { name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, category: 'Special' },
            { name: 'Vine Whip', type: 'Grass', power: 45, accuracy: 100, category: 'Physical' },
            { name: 'Thunder Shock', type: 'Electric', power: 40, accuracy: 100, category: 'Special' },
            { name: 'Confusion', type: 'Psychic', power: 50, accuracy: 100, category: 'Special' },
            { name: 'Rock Throw', type: 'Rock', power: 50, accuracy: 90, category: 'Physical' },
            { name: 'Bite', type: 'Dark', power: 60, accuracy: 100, category: 'Physical' }
        ];
    }

    // Utility functions
    formatNumber(num) {
        return num.toString().padStart(3, '0');
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getTypeColor(type) {
        const typeInfo = this.typeData.find(t => t.name.toLowerCase() === type.toLowerCase());
        return typeInfo ? typeInfo.color : '#A8A878';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pokemonGallery = new PokemonGallery();
});
