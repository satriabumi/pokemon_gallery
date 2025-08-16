// Detail Pokemon Page JavaScript with PokeAPI Integration
class DetailPokemonPage {
    constructor() {
        this.baseApiUrl = 'https://pokeapi.co/api/v2';
        this.currentPokemonId = null;
        this.pokemonData = null;
        this.speciesData = null;
        this.evolutionData = null;
        this.init();
    }

    init() {
        console.log('DetailPokemonPage init() called');
        console.log('Protocol:', window.location.protocol);
        
        this.getPokemonIdFromUrl();
        this.setupEventListeners();
        
        // Try API integration for HTTP/HTTPS, fallback for file://
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            console.log('Attempting API integration for Detail Pokemon...');
            this.loadPokemonFromAPI().catch(() => {
                console.log('API failed, using fallback data');
                this.loadFallbackData();
            });
        } else {
            console.log('Using fallback data for file:// protocol');
            this.loadFallbackData();
        }
    }

    getPokemonIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentPokemonId = parseInt(urlParams.get('id')) || 1;
        console.log('Pokemon ID from URL:', this.currentPokemonId);
    }

    async loadPokemonFromAPI() {
        console.log(`Loading Pokemon ID ${this.currentPokemonId} from API...`);
        this.showLoading();
        
        try {
            // Fetch Pokemon basic data
            const pokemonResponse = await fetch(`${this.baseApiUrl}/pokemon/${this.currentPokemonId}`);
            if (!pokemonResponse.ok) {
                throw new Error(`Pokemon not found: ${pokemonResponse.status}`);
            }
            const pokemon = await pokemonResponse.json();
            
            // Fetch Pokemon species data for description and evolution
            const speciesResponse = await fetch(`${this.baseApiUrl}/pokemon-species/${this.currentPokemonId}`);
            if (!speciesResponse.ok) {
                throw new Error(`Species not found: ${speciesResponse.status}`);
            }
            const species = await speciesResponse.json();
            
            // Process Pokemon data
            this.pokemonData = await this.processPokemonData(pokemon, species);
            
            // Load evolution chain
            await this.loadEvolutionChain(species.evolution_chain.url);
            
            // Load moves (first 8 moves)
            await this.loadPokemonMoves(pokemon);
            
            console.log('Successfully loaded Pokemon from API:', this.pokemonData);
            this.renderPokemonDetail();
            
        } catch (error) {
            console.error('Error loading Pokemon from API:', error);
            throw error; // Re-throw to trigger fallback
        }
    }

    async processPokemonData(pokemon, species) {
        // Get English description
        const description = species.flavor_text_entries
            .find(entry => entry.language.name === 'en')?.flavor_text
            .replace(/\f/g, ' ') || 'A mysterious Pokemon with amazing abilities.';
        
        // Get abilities
        const abilities = pokemon.abilities.map(ability => 
            this.capitalizeFirst(ability.ability.name.replace('-', ' '))
        );
        
        // Get types
        const types = pokemon.types.map(type => 
            this.capitalizeFirst(type.type.name)
        );
        
        // Get stats
        const stats = {};
        pokemon.stats.forEach(stat => {
            const statName = stat.stat.name.replace('-', '_');
            stats[statName] = stat.base_stat;
        });
        
        return {
            id: pokemon.id,
            name: this.capitalizeFirst(pokemon.name),
            type: types,
            image: pokemon.sprites.other['official-artwork'].front_default || 
                   pokemon.sprites.front_default ||
                   'assets/img/icon/pokemon-placeholder.png',
            height: `${pokemon.height / 10}m`, // Convert decimeters to meters
            weight: `${pokemon.weight / 10}kg`, // Convert hectograms to kilograms
            category: species.genera.find(genus => genus.language.name === 'en')?.genus || 'Unknown Pokemon',
            abilities: abilities,
            stats: {
                hp: stats.hp,
                attack: stats.attack,
                defense: stats.defense,
                speed: stats.speed,
                special_attack: stats.special_attack,
                special_defense: stats.special_defense
            },
            description: description,
            evolution: [], // Will be filled by loadEvolutionChain
            moves: [] // Will be filled by loadPokemonMoves
        };
    }

    async loadEvolutionChain(evolutionChainUrl) {
        try {
            const response = await fetch(evolutionChainUrl);
            if (!response.ok) throw new Error('Evolution chain not found');
            
            const evolutionChain = await response.json();
            const evolutionData = await this.processEvolutionChain(evolutionChain.chain);
            
            this.pokemonData.evolution = evolutionData;
            
        } catch (error) {
            console.error('Error loading evolution chain:', error);
            this.pokemonData.evolution = []; // Empty evolution chain on error
        }
    }

    async processEvolutionChain(chain) {
        const evolutionArray = [];
        let current = chain;
        
        while (current) {
            const pokemonId = this.extractPokemonId(current.species.url);
            evolutionArray.push({
                id: pokemonId,
                name: this.capitalizeFirst(current.species.name),
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
            });
            
            current = current.evolves_to[0]; // Take first evolution path
        }
        
        return evolutionArray;
    }

    async loadPokemonMoves(pokemon) {
        try {
            // Get first 8 moves that can be learned by level up
            const levelUpMoves = pokemon.moves
                .filter(move => move.version_group_details.some(detail => 
                    detail.move_learn_method.name === 'level-up'
                ))
                .slice(0, 8);
            
            const movesData = [];
            
            for (const moveEntry of levelUpMoves) {
                try {
                    const moveResponse = await fetch(moveEntry.move.url);
                    if (moveResponse.ok) {
                        const moveData = await moveResponse.json();
                        movesData.push({
                            name: this.capitalizeFirst(moveData.name.replace('-', ' ')),
                            type: this.capitalizeFirst(moveData.type.name),
                            power: moveData.power || 0,
                            accuracy: moveData.accuracy || 100,
                            category: this.capitalizeFirst(moveData.damage_class.name)
                        });
                    }
                } catch (error) {
                    console.error('Error loading move:', error);
                }
            }
            
            this.pokemonData.moves = movesData;
            
        } catch (error) {
            console.error('Error loading Pokemon moves:', error);
            this.pokemonData.moves = [];
        }
    }

    extractPokemonId(url) {
        const matches = url.match(/\/(\d+)\/$/);
        return matches ? parseInt(matches[1]) : 1;
    }

    capitalizeFirst(str) {
        if (!str) return ''; // Tambahkan cek untuk string kosong/null
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    loadFallbackData() {
        console.log('Loading fallback Pokemon data...');
        this.showLoading();
        
        // Fallback data for Pokemon details
        const pokemonDatabase = {
            1: {
                id: 1,
                name: 'Bulbasaur',
                type: ['Grass', 'Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
                height: '0.7m',
                weight: '6.9kg',
                category: 'Seed Pokemon',
                abilities: ['Overgrow', 'Chlorophyll'],
                stats: { hp: 45, attack: 49, defense: 49, speed: 45, special_attack: 65, special_defense: 65 },
                evolution: [
                    { id: 1, name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' },
                    { id: 2, name: 'Ivysaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png' },
                    { id: 3, name: 'Venusaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png' }
                ],
                moves: [
                    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, category: 'Physical' },
                    { name: 'Vine Whip', type: 'Grass', power: 45, accuracy: 100, category: 'Physical' },
                    { name: 'Poison Powder', type: 'Poison', power: 0, accuracy: 75, category: 'Status' },
                    { name: 'Razor Leaf', type: 'Grass', power: 55, accuracy: 95, category: 'Physical' }
                ],
                description: 'Bulbasaur can be seen napping in bright sunlight. There is a seed on its back. By soaking up the sun\'s rays, the seed grows progressively larger.'
            },
            4: {
                id: 4,
                name: 'Charmander',
                type: ['Fire'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
                height: '0.6m',
                weight: '8.5kg',
                category: 'Lizard Pokemon',
                abilities: ['Blaze', 'Solar Power'],
                stats: { hp: 39, attack: 52, defense: 43, speed: 65, special_attack: 60, special_defense: 50 },
                evolution: [
                    { id: 4, name: 'Charmander', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' },
                    { id: 5, name: 'Charmeleon', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png' },
                    { id: 6, name: 'Charizard', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png' }
                ],
                moves: [
                    { name: 'Scratch', type: 'Normal', power: 40, accuracy: 100, category: 'Physical' },
                    { name: 'Ember', type: 'Fire', power: 40, accuracy: 100, category: 'Special' },
                    { name: 'Fire Fang', type: 'Fire', power: 65, accuracy: 95, category: 'Physical' },
                    { name: 'Flame Burst', type: 'Fire', power: 70, accuracy: 100, category: 'Special' }
                ],
                description: 'The flame that burns at the tip of its tail is an indication of its emotions. The flame wavers when Charmander is enjoying itself.'
            },
            7: {
                id: 7,
                name: 'Squirtle',
                type: ['Water'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
                height: '0.5m',
                weight: '9.0kg',
                category: 'Tiny Turtle Pokemon',
                abilities: ['Torrent', 'Rain Dish'],
                stats: { hp: 44, attack: 48, defense: 65, speed: 43, special_attack: 50, special_defense: 64 },
                evolution: [
                    { id: 7, name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png' },
                    { id: 8, name: 'Wartortle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png' },
                    { id: 9, name: 'Blastoise', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png' }
                ],
                moves: [
                    { name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, category: 'Physical' },
                    { name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, category: 'Special' },
                    { name: 'Bite', type: 'Dark', power: 60, accuracy: 100, category: 'Physical' },
                    { name: 'Aqua Jet', type: 'Water', power: 40, accuracy: 100, category: 'Physical' }
                ],
                description: 'Squirtle\'s shell is not merely used for protection. The shell\'s rounded shape and the grooves on its surface help minimize resistance in water.'
            },
            25: {
                id: 25,
                name: 'Pikachu',
                type: ['Electric'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                height: '0.4m',
                weight: '6.0kg',
                category: 'Mouse Pokemon',
                abilities: ['Static', 'Lightning Rod'],
                stats: { hp: 35, attack: 55, defense: 40, speed: 90, special_attack: 50, special_defense: 50 },
                evolution: [
                    { id: 172, name: 'Pichu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/172.png' },
                    { id: 25, name: 'Pikachu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
                    { id: 26, name: 'Raichu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png' }
                ],
                moves: [
                    { name: 'Thunder Shock', type: 'Electric', power: 40, accuracy: 100, category: 'Special' },
                    { name: 'Quick Attack', type: 'Normal', power: 40, accuracy: 100, category: 'Physical' },
                    { name: 'Thunderbolt', type: 'Electric', power: 90, accuracy: 100, category: 'Special' },
                    { name: 'Iron Tail', type: 'Steel', power: 100, accuracy: 75, category: 'Physical' }
                ],
                description: 'When Pikachu meet, they\'ll touch their tails together and exchange electricity through them as a form of greeting.'
            },
            150: {
                id: 150,
                name: 'Mewtwo',
                type: ['Psychic'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
                height: '2.0m',
                weight: '122.0kg',
                category: 'Genetic Pokemon',
                abilities: ['Pressure', 'Unnerve'],
                stats: { hp: 106, attack: 110, defense: 90, speed: 130, special_attack: 154, special_defense: 90 },
                evolution: [
                    { id: 150, name: 'Mewtwo', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png' }
                ],
                moves: [
                    { name: 'Confusion', type: 'Psychic', power: 50, accuracy: 100, category: 'Special' },
                    { name: 'Psychic', type: 'Psychic', power: 90, accuracy: 100, category: 'Special' },
                    { name: 'Shadow Ball', type: 'Ghost', power: 80, accuracy: 100, category: 'Special' },
                    { name: 'Aura Sphere', type: 'Fighting', power: 80, accuracy: 100, category: 'Special' }
                ],
                description: 'Mewtwo is a Pokemon that was created by genetic manipulation. However, even though the scientific power of humans created this Pokemon\'s body, they failed to endow Mewtwo with a compassionate heart.'
            },
            448: {
                id: 448,
                name: 'Lucario',
                type: ['Fighting', 'Steel'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
                height: '1.2m',
                weight: '54.0kg',
                category: 'Aura Pokemon',
                abilities: ['Steadfast', 'Inner Focus'],
                stats: { hp: 70, attack: 110, defense: 70, speed: 90, special_attack: 115, special_defense: 70 },
                evolution: [
                    { id: 447, name: 'Riolu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/447.png' },
                    { id: 448, name: 'Lucario', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png' }
                ],
                moves: [
                    { name: 'Aura Sphere', type: 'Fighting', power: 80, accuracy: 100, category: 'Special' },
                    { name: 'Close Combat', type: 'Fighting', power: 120, accuracy: 100, category: 'Physical' },
                    { name: 'Metal Claw', type: 'Steel', power: 50, accuracy: 95, category: 'Physical' },
                    { name: 'Extreme Speed', type: 'Normal', power: 80, accuracy: 100, category: 'Physical' }
                ],
                description: 'It has the ability to sense the auras of all things. It understands human speech and is highly intelligent.'
            }
        };

        this.pokemonData = pokemonDatabase[this.currentPokemonId];
        
        setTimeout(() => {
            if (this.pokemonData) {
                this.renderPokemonDetail();
            } else {
                this.showError();
            }
        }, 1000); // Simulate loading time
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
        
        // Special Attack
        // Pastikan elemen ada sebelum mencoba mengaksesnya
        const spAttackValue = document.getElementById('special-attack-value');
        const spAttackBar = document.getElementById('special-attack-bar');
        if (spAttackValue && spAttackBar) {
            spAttackValue.textContent = stats.special_attack;
            spAttackBar.style.width = `${(stats.special_attack / maxStat) * 100}%`;
        }
        
        // Special Defense
        // Pastikan elemen ada sebelum mencoba mengaksesnya
        const spDefenseValue = document.getElementById('special-defense-value');
        const spDefenseBar = document.getElementById('special-defense-bar');
        if (spDefenseValue && spDefenseBar) {
            spDefenseValue.textContent = stats.special_defense;
            spDefenseBar.style.width = `${(stats.special_defense / maxStat) * 100}%`;
        }
        
        // Speed
        document.getElementById('speed-value').textContent = stats.speed;
        const speedBar = document.getElementById('speed-bar');
        speedBar.style.width = `${(stats.speed / maxStat) * 100}%`;
    }

    renderTypeEffectiveness() {
        // Menggunakan fungsi calculateTypeEffectiveness yang lama untuk fallback data
        // Jika menggunakan API, Anda akan menggunakan this.pokemonData.typeEffectiveness
        const typeEffectiveness = this.pokemonData.typeEffectiveness || this.calculateTypeEffectiveness();
        
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

    // Fungsi ini hanya digunakan untuk data fallback.
    // Untuk data API, efektivitas tipe diambil dari fetchTypeEffectiveness.
    calculateTypeEffectiveness() {
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
        
        if (this.pokemonData.evolution && this.pokemonData.evolution.length > 0) {
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
        } else {
            evolutionContainer.innerHTML = '<p>Tidak ada rantai evolusi yang dapat ditampilkan.</p>';
        }
    }

    renderMoves() {
        const movesContainer = document.getElementById('moves-grid');
        movesContainer.innerHTML = '';
        
        if (this.pokemonData.moves && this.pokemonData.moves.length > 0) {
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
        } else {
            movesContainer.innerHTML = '<p>Tidak ada jurus yang dapat ditampilkan.</p>';
        }
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

    showLoading() {
        const loading = document.getElementById('loading');
        const pokemonDetail = document.getElementById('pokemon-detail');
        const errorState = document.getElementById('error-state');
        
        if (loading) loading.style.display = 'flex'; // Gunakan flex untuk centering
        if (pokemonDetail) pokemonDetail.style.display = 'none';
        if (errorState) errorState.style.display = 'none';
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
            errorState.style.display = 'flex'; // Gunakan flex untuk centering
        }
        const pokemonDetail = document.getElementById('pokemon-detail');
        if (pokemonDetail) pokemonDetail.style.display = 'none';
    }
}

// Initialize detail Pokemon page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.detailPokemonPage = new DetailPokemonPage();
});