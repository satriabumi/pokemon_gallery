// Detail Pokemon Page JavaScript
class DetailPokemonPage {
    constructor() {
        this.currentPokemonId = null;
        this.pokemonData = null;
        this.init();
    }

    init() {
        this.getPokemonIdFromUrl();
        this.loadPokemonData();
        this.setupEventListeners();
    }

    getPokemonIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentPokemonId = parseInt(urlParams.get('id')) || 1;
    }

    loadPokemonData() {
        // Mock data for Pokemon details
        const pokemonDatabase = {
            1: {
                id: 1,
                name: 'Bulbasaur',
                type: ['Grass', 'Poison'],
                image: 'assets/img/pokemon/bulbasaur.png',
                height: '0.7m',
                weight: '6.9kg',
                category: 'Seed Pokemon',
                abilities: ['Overgrow', 'Chlorophyll'],
                stats: { hp: 45, attack: 49, defense: 49, speed: 45 },
                evolution: [
                    { id: 1, name: 'Bulbasaur', image: 'assets/img/pokemon/bulbasaur.png' },
                    { id: 2, name: 'Ivysaur', image: 'assets/img/pokemon/ivysaur.png' },
                    { id: 3, name: 'Venusaur', image: 'assets/img/pokemon/venusaur.png' }
                ],
                moves: [
                    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, category: 'Physical' },
                    { name: 'Vine Whip', type: 'Grass', power: 45, accuracy: 100, category: 'Physical' },
                    { name: 'Poison Powder', type: 'Poison', power: 0, accuracy: 75, category: 'Status' },
                    { name: 'Razor Leaf', type: 'Grass', power: 55, accuracy: 95, category: 'Physical' }
                ],
                description: 'Bulbasaur adalah Pokemon yang lahir dengan benih di punggungnya. Benih ini tumbuh bersama dengan Pokemon ini.'
            },
            4: {
                id: 4,
                name: 'Charmander',
                type: ['Fire'],
                image: 'assets/img/pokemon/charmander.png',
                height: '0.6m',
                weight: '8.5kg',
                category: 'Lizard Pokemon',
                abilities: ['Blaze', 'Solar Power'],
                stats: { hp: 39, attack: 52, defense: 43, speed: 65 },
                evolution: [
                    { id: 4, name: 'Charmander', image: 'assets/img/pokemon/charmander.png' },
                    { id: 5, name: 'Charmeleon', image: 'assets/img/pokemon/charmeleon.png' },
                    { id: 6, name: 'Charizard', image: 'assets/img/pokemon/charizard.png' }
                ],
                moves: [
                    { name: 'Scratch', type: 'Normal', power: 40, accuracy: 100, category: 'Physical' },
                    { name: 'Ember', type: 'Fire', power: 40, accuracy: 100, category: 'Special' },
                    { name: 'Fire Fang', type: 'Fire', power: 65, accuracy: 95, category: 'Physical' },
                    { name: 'Flame Burst', type: 'Fire', power: 70, accuracy: 100, category: 'Special' }
                ],
                description: 'Charmander adalah Pokemon yang menyukai hal-hal panas. Dikatakan bahwa ketika hujan, uap keluar dari ujung ekornya.'
            },
            7: {
                id: 7,
                name: 'Squirtle',
                type: ['Water'],
                image: 'assets/img/pokemon/squirtle.png',
                height: '0.5m',
                weight: '9.0kg',
                category: 'Tiny Turtle Pokemon',
                abilities: ['Torrent', 'Rain Dish'],
                stats: { hp: 44, attack: 48, defense: 65, speed: 43 },
                evolution: [
                    { id: 7, name: 'Squirtle', image: 'assets/img/pokemon/squirtle.png' },
                    { id: 8, name: 'Wartortle', image: 'assets/img/pokemon/wartortle.png' },
                    { id: 9, name: 'Blastoise', image: 'assets/img/pokemon/blastoise.png' }
                ],
                moves: [
                    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, category: 'Physical' },
                    { name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, category: 'Special' },
                    { name: 'Bite', type: 'Dark', power: 60, accuracy: 100, category: 'Physical' },
                    { name: 'Aqua Jet', type: 'Water', power: 40, accuracy: 100, category: 'Physical' }
                ],
                description: 'Squirtle adalah Pokemon yang sangat loyal kepada Trainernya. Cangkangnya tidak hanya untuk perlindungan, tetapi juga untuk mengurangi hambatan air.'
            },
            25: {
                id: 25,
                name: 'Pikachu',
                type: ['Electric'],
                image: 'assets/img/pokemon/pikachu.png',
                height: '0.4m',
                weight: '6.0kg',
                category: 'Mouse Pokemon',
                abilities: ['Static', 'Lightning Rod'],
                stats: { hp: 35, attack: 55, defense: 40, speed: 90 },
                evolution: [
                    { id: 172, name: 'Pichu', image: 'assets/img/pokemon/pichu.png' },
                    { id: 25, name: 'Pikachu', image: 'assets/img/pokemon/pikachu.png' },
                    { id: 26, name: 'Raichu', image: 'assets/img/pokemon/raichu.png' }
                ],
                moves: [
                    { name: 'Thunder Shock', type: 'Electric', power: 40, accuracy: 100, category: 'Special' },
                    { name: 'Quick Attack', type: 'Normal', power: 40, accuracy: 100, category: 'Physical' },
                    { name: 'Thunderbolt', type: 'Electric', power: 90, accuracy: 100, category: 'Special' },
                    { name: 'Iron Tail', type: 'Steel', power: 100, accuracy: 75, category: 'Physical' }
                ],
                description: 'Pikachu adalah Pokemon yang sangat populer dan terkenal. Ketika beberapa Pikachu berkumpul, listrik mereka dapat menyebabkan badai listrik.'
            }
        };

        this.pokemonData = pokemonDatabase[this.currentPokemonId];
        
        if (this.pokemonData) {
            this.renderPokemonDetail();
        } else {
            this.showError();
        }
    }

    renderPokemonDetail() {
        this.hideLoading();
        this.showPokemonDetail();
        
        // Set basic info
        document.getElementById('pokemon-name').textContent = this.pokemonData.name;
        document.getElementById('pokemon-id').textContent = `#${this.formatNumber(this.pokemonData.id)}`;
        document.getElementById('pokemon-image').src = this.pokemonData.image;
        document.getElementById('pokemon-image').alt = this.pokemonData.name;
        document.getElementById('pokemon-description').textContent = this.pokemonData.description;
        
        // Set types
        this.renderTypes();
        
        // Set basic stats
        document.getElementById('pokemon-height').textContent = this.pokemonData.height;
        document.getElementById('pokemon-weight').textContent = this.pokemonData.weight;
        document.getElementById('pokemon-category').textContent = this.pokemonData.category;
        document.getElementById('pokemon-abilities').textContent = this.pokemonData.abilities.join(', ');
        
        // Set base stats
        this.renderBaseStats();
        
        // Set type effectiveness
        this.renderTypeEffectiveness();
        
        // Set evolution chain
        this.renderEvolutionChain();
        
        // Set moves
        this.renderMoves();
        
        // Setup navigation
        this.setupNavigation();
    }

    renderTypes() {
        const typesContainer = document.getElementById('pokemon-types');
        typesContainer.innerHTML = '';
        
        this.pokemonData.type.forEach(type => {
            const typeElement = document.createElement('span');
            typeElement.className = `pokemon-type type-badge ${type.toLowerCase()}`;
            typeElement.textContent = type;
            typeElement.style.backgroundColor = this.getTypeColor(type);
            typesContainer.appendChild(typeElement);
        });
    }

    renderBaseStats() {
        const stats = this.pokemonData.stats;
        const maxStat = 255; // Maximum possible stat value
        
        // HP
        document.getElementById('hp-value').textContent = stats.hp;
        const hpBar = document.getElementById('hp-bar');
        hpBar.style.width = `${(stats.hp / maxStat) * 100}%`;
        
        // Attack
        document.getElementById('attack-value').textContent = stats.attack;
        const attackBar = document.getElementById('attack-bar');
        attackBar.style.width = `${(stats.attack / maxStat) * 100}%`;
        
        // Defense
        document.getElementById('defense-value').textContent = stats.defense;
        const defenseBar = document.getElementById('defense-bar');
        defenseBar.style.width = `${(stats.defense / maxStat) * 100}%`;
        
        // Speed
        document.getElementById('speed-value').textContent = stats.speed;
        const speedBar = document.getElementById('speed-bar');
        speedBar.style.width = `${(stats.speed / maxStat) * 100}%`;
    }

    renderTypeEffectiveness() {
        const typeEffectiveness = this.calculateTypeEffectiveness();
        
        // Weaknesses
        const weaknessesContainer = document.getElementById('weaknesses');
        weaknessesContainer.innerHTML = '';
        typeEffectiveness.weaknesses.forEach(type => {
            const typeElement = document.createElement('span');
            typeElement.className = `type-badge ${type.toLowerCase()}`;
            typeElement.textContent = type;
            typeElement.style.backgroundColor = this.getTypeColor(type);
            weaknessesContainer.appendChild(typeElement);
        });
        
        // Resistances
        const resistancesContainer = document.getElementById('resistances');
        resistancesContainer.innerHTML = '';
        typeEffectiveness.resistances.forEach(type => {
            const typeElement = document.createElement('span');
            typeElement.className = `type-badge ${type.toLowerCase()}`;
            typeElement.textContent = type;
            typeElement.style.backgroundColor = this.getTypeColor(type);
            resistancesContainer.appendChild(typeElement);
        });
        
        // Immunities
        const immunitiesContainer = document.getElementById('immunities');
        immunitiesContainer.innerHTML = '';
        typeEffectiveness.immunities.forEach(type => {
            const typeElement = document.createElement('span');
            typeElement.className = `type-badge ${type.toLowerCase()}`;
            typeElement.textContent = type;
            typeElement.style.backgroundColor = this.getTypeColor(type);
            immunitiesContainer.appendChild(typeElement);
        });
    }

    calculateTypeEffectiveness() {
        // Simplified type effectiveness calculation
        const effectiveness = {
            weaknesses: [],
            resistances: [],
            immunities: []
        };
        
        this.pokemonData.type.forEach(type => {
            switch(type.toLowerCase()) {
                case 'grass':
                    effectiveness.weaknesses.push('Fire', 'Ice', 'Poison', 'Flying', 'Bug');
                    effectiveness.resistances.push('Water', 'Electric', 'Grass', 'Ground');
                    break;
                case 'fire':
                    effectiveness.weaknesses.push('Water', 'Ground', 'Rock');
                    effectiveness.resistances.push('Fire', 'Grass', 'Ice', 'Bug', 'Steel', 'Fairy');
                    break;
                case 'water':
                    effectiveness.weaknesses.push('Electric', 'Grass');
                    effectiveness.resistances.push('Fire', 'Water', 'Ice', 'Steel');
                    break;
                case 'electric':
                    effectiveness.weaknesses.push('Ground');
                    effectiveness.resistances.push('Electric', 'Flying', 'Steel');
                    break;
                case 'poison':
                    effectiveness.weaknesses.push('Ground', 'Psychic');
                    effectiveness.resistances.push('Grass', 'Fighting', 'Poison', 'Bug', 'Fairy');
                    break;
                case 'ground':
                    effectiveness.weaknesses.push('Water', 'Grass', 'Ice');
                    effectiveness.resistances.push('Poison', 'Rock');
                    effectiveness.immunities.push('Electric');
                    break;
                case 'flying':
                    effectiveness.weaknesses.push('Electric', 'Ice', 'Rock');
                    effectiveness.resistances.push('Grass', 'Fighting', 'Bug');
                    effectiveness.immunities.push('Ground');
                    break;
                case 'psychic':
                    effectiveness.weaknesses.push('Bug', 'Ghost', 'Dark');
                    effectiveness.resistances.push('Fighting', 'Psychic');
                    break;
                case 'bug':
                    effectiveness.weaknesses.push('Fire', 'Flying', 'Rock');
                    effectiveness.resistances.push('Grass', 'Fighting', 'Ground');
                    break;
                case 'rock':
                    effectiveness.weaknesses.push('Water', 'Grass', 'Fighting', 'Ground', 'Steel');
                    effectiveness.resistances.push('Normal', 'Fire', 'Poison', 'Flying');
                    break;
                case 'ghost':
                    effectiveness.weaknesses.push('Ghost', 'Dark');
                    effectiveness.resistances.push('Poison', 'Bug');
                    effectiveness.immunities.push('Normal', 'Fighting');
                    break;
                case 'dragon':
                    effectiveness.weaknesses.push('Ice', 'Dragon', 'Fairy');
                    effectiveness.resistances.push('Fire', 'Water', 'Electric', 'Grass');
                    break;
                case 'dark':
                    effectiveness.weaknesses.push('Fighting', 'Bug', 'Fairy');
                    effectiveness.resistances.push('Ghost', 'Dark');
                    effectiveness.immunities.push('Psychic');
                    break;
                case 'steel':
                    effectiveness.weaknesses.push('Fire', 'Fighting', 'Ground');
                    effectiveness.resistances.push('Normal', 'Grass', 'Ice', 'Flying', 'Psychic', 'Bug', 'Rock', 'Dragon', 'Steel', 'Fairy');
                    effectiveness.immunities.push('Poison');
                    break;
                case 'fairy':
                    effectiveness.weaknesses.push('Poison', 'Steel');
                    effectiveness.resistances.push('Fighting', 'Bug', 'Dark');
                    effectiveness.immunities.push('Dragon');
                    break;
                default: // Normal
                    effectiveness.weaknesses.push('Fighting');
                    effectiveness.immunities.push('Ghost');
                    break;
            }
        });
        
        return effectiveness;
    }

    renderEvolutionChain() {
        const evolutionContainer = document.getElementById('evolution-chain');
        evolutionContainer.innerHTML = '';
        
        this.pokemonData.evolution.forEach((evolution, index) => {
            // Add evolution item
            const evolutionItem = document.createElement('div');
            evolutionItem.className = 'evolution-item';
            evolutionItem.innerHTML = `
                <div class="evolution-image">
                    <img src="${evolution.image}" alt="${evolution.name}" onerror="this.src='assets/img/icon/pokemon-placeholder.png'">
                </div>
                <div class="evolution-name">${evolution.name}</div>
            `;
            
            // Add click event to navigate to evolution
            evolutionItem.addEventListener('click', () => {
                window.location.href = `detailpokemon.html?id=${evolution.id}`;
            });
            
            evolutionContainer.appendChild(evolutionItem);
            
            // Add arrow between evolutions (except for the last one)
            if (index < this.pokemonData.evolution.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'evolution-arrow';
                arrow.innerHTML = '→';
                evolutionContainer.appendChild(arrow);
            }
        });
    }

    renderMoves() {
        const movesContainer = document.getElementById('moves-grid');
        movesContainer.innerHTML = '';
        
        this.pokemonData.moves.forEach(move => {
            const moveCard = document.createElement('div');
            moveCard.className = 'move-card';
            moveCard.innerHTML = `
                <div class="move-header">
                    <span class="move-name">${move.name}</span>
                    <span class="move-type type-badge ${move.type.toLowerCase()}" style="background-color: ${this.getTypeColor(move.type)}">${move.type}</span>
                </div>
                <div class="move-stats">
                    <div class="move-stat">
                        <span>Power</span>
                        <span>${move.power}</span>
                    </div>
                    <div class="move-stat">
                        <span>Accuracy</span>
                        <span>${move.accuracy}%</span>
                    </div>
                    <div class="move-stat">
                        <span>Category</span>
                        <span>${move.category}</span>
                    </div>
                </div>
            `;
            movesContainer.appendChild(moveCard);
        });
    }

    setupNavigation() {
        const prevBtn = document.getElementById('prev-pokemon');
        const nextBtn = document.getElementById('next-pokemon');
        
        // Previous Pokemon
        prevBtn.addEventListener('click', () => {
            const prevId = Math.max(1, this.currentPokemonId - 1);
            window.location.href = `detailpokemon.html?id=${prevId}`;
        });
        
        // Next Pokemon
        nextBtn.addEventListener('click', () => {
            const nextId = this.currentPokemonId + 1;
            window.location.href = `detailpokemon.html?id=${nextId}`;
        });
    }

    setupEventListeners() {
        // Add any additional event listeners here
    }

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

    formatNumber(num) {
        return num.toString().padStart(3, '0');
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showPokemonDetail() {
        const pokemonDetail = document.getElementById('pokemon-detail');
        if (pokemonDetail) {
            pokemonDetail.style.display = 'block';
        }
    }

    showError() {
        this.hideLoading();
        const errorState = document.getElementById('error-state');
        if (errorState) {
            errorState.style.display = 'block';
        }
    }
}

// Initialize detail Pokemon page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.detailPokemonPage = new DetailPokemonPage();
});

// Add CSS for enhanced animations
const style = document.createElement('style');
style.textContent = `
    .pokemon-image {
        animation: fadeInScale 0.8s ease-out;
    }

    .stats-card {
        animation: fadeInUp 0.6s ease-out;
        animation-fill-mode: both;
    }

    .stats-card:nth-child(1) { animation-delay: 0.1s; }
    .stats-card:nth-child(2) { animation-delay: 0.2s; }
    .stats-card:nth-child(3) { animation-delay: 0.3s; }

    .move-card {
        animation: fadeInUp 0.6s ease-out;
        animation-fill-mode: both;
    }

    .move-card:nth-child(1) { animation-delay: 0.1s; }
    .move-card:nth-child(2) { animation-delay: 0.2s; }
    .move-card:nth-child(3) { animation-delay: 0.3s; }
    .move-card:nth-child(4) { animation-delay: 0.4s; }

    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

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

    .stat-bar-fill {
        animation: fillBar 1.5s ease-out;
    }

    @keyframes fillBar {
        from { width: 0%; }
        to { width: var(--fill-width); }
    }

    .evolution-image {
        transition: transform 0.3s ease;
    }

    .evolution-image:hover {
        transform: scale(1.1);
    }

    .move-card:hover {
        transform: translateY(-4px);
    }
`;
document.head.appendChild(style);
