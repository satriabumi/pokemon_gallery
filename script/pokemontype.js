// Pokemon Types Page JavaScript
class PokemonTypesPage {
    constructor() {
        this.baseApiUrl = 'https://pokeapi.co/api/v2';
        this.allTypeNames = [
            'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting',
            'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost',
            'dragon', 'dark', 'steel', 'fairy'
        ];
        this.typesData = []; // Akan diisi dari API atau fallback
        this.typeEffectivenessMatrix = {}; // Akan menyimpan matriks efektivitas (Attacking -> Defending -> Multiplier)
        this.init();
    }

    init() {
        console.log('PokemonTypesPage init() called');
        console.log('Protocol:', window.location.protocol);

        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            console.log('Attempting API integration for Pokemon Types...');
            this.loadTypesFromAPI().catch(() => {
                console.log('API failed, using fallback data for types');
                this.loadFallbackData();
            });
        } else {
            console.log('Using fallback data for file:// protocol for types');
            this.loadFallbackData();
        }
    }

    async loadTypesFromAPI() {
        console.log('Loading types from PokeAPI...');
        this.showLoading();
        
        try {
            const typePromises = this.allTypeNames.map(typeName => this.fetchTypeData(typeName));
            const typeResults = await Promise.allSettled(typePromises);
            
            const successfulResults = typeResults
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            
            if (successfulResults.length === 0) {
                throw new Error('No successful API calls for types');
            }
            
            this.typesData = successfulResults.sort((a, b) => a.name.localeCompare(b.name));
            this.buildTypeEffectivenessMatrix(); // Bangun matriks setelah semua data tipe dimuat
            this.renderTypes();
            this.renderTypeChart(); // Render chart setelah matriks dibangun
            this.hideLoading();
            console.log('Pokemon types and chart loaded successfully from API!');

        } catch (error) {
            console.error('Error loading types from API:', error);
            this.showError();
            throw error;
        }
    }

    async fetchTypeData(typeName) {
        try {
            const response = await fetch(`${this.baseApiUrl}/type/${typeName}`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for type ${typeName}`);
            }
            
            const data = await response.json();
            
            return {
                name: this.capitalizeFirst(typeName),
                color: this.getTypeColor(typeName),
                weaknesses: data.damage_relations.double_damage_from.map(t => this.capitalizeFirst(t.name)),
                resistances: data.damage_relations.half_damage_from.map(t => this.capitalizeFirst(t.name)),
                immunities: data.damage_relations.no_damage_from.map(t => this.capitalizeFirst(t.name)),
                // Simpan damage_relations untuk membangun chart
                damage_relations: {
                    double_damage_to: data.damage_relations.double_damage_to.map(t => t.name),
                    half_damage_to: data.damage_relations.half_damage_to.map(t => t.name),
                    no_damage_to: data.damage_relations.no_damage_to.map(t => t.name)
                }
            };
        } catch (error) {
            console.error(`Error fetching type ${typeName}:`, error);
            throw error;
        }
    }

    loadFallbackData() {
        console.log('Loading fallback types data...');
        this.showLoading();

        // Data fallback lengkap untuk semua 18 tipe, termasuk damage_relations
        this.typesData = [
            { name: 'Normal', color: '#A8A878', weaknesses: ['Fighting'], resistances: [], immunities: ['Ghost'], damage_relations: { double_damage_to: [], half_damage_to: ['rock', 'steel'], no_damage_to: ['ghost'] } },
            { name: 'Fire', color: '#F08030', weaknesses: ['Water', 'Ground', 'Rock'], resistances: ['Fire', 'Grass', 'Ice', 'Bug', 'Steel', 'Fairy'], immunities: [], damage_relations: { double_damage_to: ['grass', 'ice', 'bug', 'steel'], half_damage_to: ['fire', 'water', 'rock', 'dragon'], no_damage_to: [] } },
            { name: 'Water', color: '#6890F0', weaknesses: ['Electric', 'Grass'], resistances: ['Fire', 'Water', 'Ice', 'Steel'], immunities: [], damage_relations: { double_damage_to: ['fire', 'ground', 'rock'], half_damage_to: ['water', 'grass', 'dragon'], no_damage_to: [] } },
            { name: 'Electric', color: '#F8D030', weaknesses: ['Ground'], resistances: ['Electric', 'Flying', 'Steel'], immunities: [], damage_relations: { double_damage_to: ['water', 'flying'], half_damage_to: ['grass', 'electric', 'dragon'], no_damage_to: ['ground'] } },
            { name: 'Grass', color: '#78C850', weaknesses: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'], resistances: ['Water', 'Electric', 'Grass', 'Ground'], immunities: [], damage_relations: { double_damage_to: ['water', 'ground', 'rock'], half_damage_to: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], no_damage_to: [] } },
            { name: 'Ice', color: '#98D8D8', weaknesses: ['Fire', 'Fighting', 'Rock', 'Steel'], resistances: ['Ice'], immunities: [], damage_relations: { double_damage_to: ['grass', 'ground', 'flying', 'dragon'], half_damage_to: ['fire', 'water', 'ice', 'steel'], no_damage_to: [] } },
            { name: 'Fighting', color: '#C03028', weaknesses: ['Flying', 'Psychic', 'Fairy'], resistances: ['Bug', 'Rock', 'Dark'], immunities: [], damage_relations: { double_damage_to: ['normal', 'ice', 'rock', 'dark', 'steel'], half_damage_to: ['poison', 'flying', 'psychic', 'bug', 'fairy'], no_damage_to: ['ghost'] } },
            { name: 'Poison', color: '#A040A0', weaknesses: ['Ground', 'Psychic'], resistances: ['Grass', 'Fighting', 'Poison', 'Bug', 'Fairy'], immunities: [], damage_relations: { double_damage_to: ['grass', 'fairy'], half_damage_to: ['poison', 'ground', 'rock', 'ghost'], no_damage_to: ['steel'] } },
            { name: 'Ground', color: '#E0C068', weaknesses: ['Water', 'Grass', 'Ice'], resistances: ['Poison', 'Rock'], immunities: ['Electric'], damage_relations: { double_damage_to: ['fire', 'electric', 'poison', 'rock', 'steel'], half_damage_to: ['grass', 'bug'], no_damage_to: ['flying'] } },
            { name: 'Flying', color: '#A890F0', weaknesses: ['Electric', 'Ice', 'Rock'], resistances: ['Grass', 'Fighting', 'Bug'], immunities: ['Ground'], damage_relations: { double_damage_to: ['grass', 'fighting', 'bug'], half_damage_to: ['electric', 'rock', 'steel'], no_damage_to: [] } },
            { name: 'Psychic', color: '#F85888', weaknesses: ['Bug', 'Ghost', 'Dark'], resistances: ['Fighting', 'Psychic'], immunities: [], damage_relations: { double_damage_to: ['fighting', 'poison'], half_damage_to: ['psychic', 'steel'], no_damage_to: ['dark'] } },
            { name: 'Bug', color: '#A8B820', weaknesses: ['Fire', 'Flying', 'Rock'], resistances: ['Grass', 'Fighting', 'Ground'], immunities: [], damage_relations: { double_damage_to: ['grass', 'psychic', 'dark'], half_damage_to: ['fighting', 'flying', 'poison', 'ghost', 'steel', 'fairy'], no_damage_to: [] } },
            { name: 'Rock', color: '#B8A038', weaknesses: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'], resistances: ['Normal', 'Fire', 'Poison', 'Flying'], immunities: [], damage_relations: { double_damage_to: ['fire', 'ice', 'flying', 'bug'], half_damage_to: ['fighting', 'ground', 'steel'], no_damage_to: [] } },
            { name: 'Ghost', color: '#705898', weaknesses: ['Ghost', 'Dark'], resistances: ['Poison', 'Bug'], immunities: ['Normal', 'Fighting'], damage_relations: { double_damage_to: ['psychic', 'ghost'], half_damage_to: ['dark', 'steel'], no_damage_to: ['normal', 'fighting'] } },
            { name: 'Dragon', color: '#7038F8', weaknesses: ['Ice', 'Dragon', 'Fairy'], resistances: ['Fire', 'Water', 'Electric', 'Grass'], immunities: [], damage_relations: { double_damage_to: ['dragon'], half_damage_to: ['steel'], no_damage_to: ['fairy'] } },
            { name: 'Dark', color: '#705848', weaknesses: ['Fighting', 'Bug', 'Fairy'], resistances: ['Ghost', 'Dark'], immunities: ['Psychic'], damage_relations: { double_damage_to: ['psychic', 'ghost'], half_damage_to: ['fighting', 'dark', 'fairy'], no_damage_to: [] } },
            { name: 'Steel', color: '#B8B8D0', weaknesses: ['Fire', 'Fighting', 'Ground'], resistances: ['Normal', 'Grass', 'Ice', 'Flying', 'Psychic', 'Bug', 'Rock', 'Dragon', 'Steel', 'Fairy'], immunities: ['Poison'], damage_relations: { double_damage_to: ['ice', 'rock', 'fairy'], half_damage_to: ['fire', 'water', 'electric', 'steel'], no_damage_to: [] } },
            { name: 'Fairy', color: '#EE99AC', weaknesses: ['Poison', 'Steel'], resistances: ['Fighting', 'Bug', 'Dark'], immunities: ['Dragon'], damage_relations: { double_damage_to: ['fighting', 'dragon', 'dark'], half_damage_to: ['fire', 'poison', 'steel'], no_damage_to: [] } }
        ];

        setTimeout(() => {
            this.buildTypeEffectivenessMatrix(); // Bangun matriks dari data fallback
            this.renderTypes();
            this.renderTypeChart(); // Render chart
            this.hideLoading();
            console.log('Pokemon types and chart loaded successfully from fallback data!');
        }, 1000);
    }

    // Fungsi untuk membangun matriks efektivitas tipe
    buildTypeEffectivenessMatrix() {
        this.typeEffectivenessMatrix = {};
        const allTypeNamesLower = this.allTypeNames; // Gunakan daftar nama tipe yang sudah ada

        // Inisialisasi matriks dengan 1x untuk semua hubungan
        allTypeNamesLower.forEach(attackingType => {
            this.typeEffectivenessMatrix[attackingType] = {};
            allTypeNamesLower.forEach(defendingType => {
                this.typeEffectivenessMatrix[attackingType][defendingType] = 1; // Default 1x
            });
        });

        // Isi matriks berdasarkan damage_relations
        this.typesData.forEach(type => {
            const attackingTypeName = type.name.toLowerCase();
            if (!type.damage_relations) return; // Lewati jika tidak ada data relasi (misal, data tidak lengkap)

            type.damage_relations.double_damage_to.forEach(defendingType => {
                this.typeEffectivenessMatrix[attackingTypeName][defendingType] = 2;
            });
            type.damage_relations.half_damage_to.forEach(defendingType => {
                this.typeEffectivenessMatrix[attackingTypeName][defendingType] = 0.5;
            });
            type.damage_relations.no_damage_to.forEach(defendingType => {
                this.typeEffectivenessMatrix[attackingTypeName][defendingType] = 0;
            });
        });
        console.log('Type effectiveness matrix built:', this.typeEffectivenessMatrix);
    }

    showLoading() {
        const loading = document.getElementById('typesLoading');
        const error = document.getElementById('typesError');
        const grid = document.getElementById('types-grid');
        const chart = document.getElementById('type-chart'); // Tambahkan chart
        if (loading) loading.style.display = 'flex';
        if (error) error.style.display = 'none';
        if (grid) grid.style.display = 'none';
        if (chart) chart.style.display = 'none'; // Sembunyikan chart saat loading
    }

    hideLoading() {
        const loading = document.getElementById('typesLoading');
        const grid = document.getElementById('types-grid');
        const chart = document.getElementById('type-chart'); // Tambahkan chart
        if (loading) loading.style.display = 'none';
        if (grid) grid.style.display = 'grid';
        if (chart) chart.style.display = 'table'; // Tampilkan chart sebagai tabel
    }

    showError() {
        const error = document.getElementById('typesError');
        const loading = document.getElementById('typesLoading');
        const grid = document.getElementById('types-grid');
        const chart = document.getElementById('type-chart'); // Tambahkan chart
        if (error) error.style.display = 'flex';
        if (loading) loading.style.display = 'none';
        if (grid) grid.style.display = 'none';
        if (chart) chart.style.display = 'none'; // Sembunyikan chart saat error
    }

    retryLoadTypes() {
        this.init();
    }

    renderTypes() {
        const typesGrid = document.getElementById('types-grid');
        if (!typesGrid) return;

        typesGrid.innerHTML = '';

        this.typesData.forEach(type => {
            const typeCard = this.createTypeCard(type);
            typesGrid.appendChild(typeCard);
        });
    }

    createTypeCard(type) {
        const card = document.createElement('div');
        card.className = `type-card ${type.name.toLowerCase()}`;
        
        const weaknesses = type.weaknesses.map(t => 
            `<span class="effectiveness-badge" style="background-color: ${this.getTypeColor(t)}">${t}</span>`
        ).join('');
        
        const resistances = type.resistances.map(t => 
            `<span class="effectiveness-badge" style="background-color: ${this.getTypeColor(t)}">${t}</span>`
        ).join('');
        
        const immunities = type.immunities.map(t => 
            `<span class="effectiveness-badge" style="background-color: ${this.getTypeColor(t)}">${t}</span>`
        ).join('');

        card.innerHTML = `
            <div class="type-icon" style="background-color: ${type.color}">
                ${this.getTypeIcon(type.name)}
            </div>
            <h3>${type.name}</h3>
            <div class="type-effectiveness">
                <div class="effectiveness-group">
                    <h4>🗡️ Lemah Terhadap</h4>
                    <div class="effectiveness-list">
                        ${weaknesses || '<span class="effectiveness-badge" style="background-color: #6C757D; opacity: 0.7;">Tidak Ada</span>'}
                    </div>
                </div>
                <div class="effectiveness-group">
                    <h4>🛡️ Tahan Terhadap</h4>
                    <div class="effectiveness-list">
                        ${resistances || '<span class="effectiveness-badge" style="background-color: #6C757D; opacity: 0.7;">Tidak Ada</span>'}
                    </div>
                </div>
                ${type.immunities.length > 0 ? `
                <div class="effectiveness-group">
                    <h4>⚡ Kebal Total</h4>
                    <div class="effectiveness-list">
                        ${immunities}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        return card;
    }

    // Fungsi baru untuk merender tabel efektivitas tipe
    renderTypeChart() {
        const chartContainer = document.getElementById('type-chart');
        if (!chartContainer) return;

        chartContainer.innerHTML = ''; // Bersihkan konten sebelumnya

        const table = document.createElement('table');
        table.className = 'type-chart';

        // Header Tabel (Defending Types)
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const emptyTh = document.createElement('th');
        emptyTh.textContent = 'Attacking \\ Defending'; // Sudut kiri atas
        headerRow.appendChild(emptyTh);

        this.allTypeNames.forEach(typeName => {
            const th = document.createElement('th');
            th.textContent = this.capitalizeFirst(typeName);
            th.className = `type-header-${typeName}`; // Tambahkan kelas untuk warna
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body Tabel (Attacking Types dan Efektivitas)
        const tbody = document.createElement('tbody');
        this.allTypeNames.forEach(attackingTypeName => {
            const row = document.createElement('tr');
            const attackingTh = document.createElement('th');
            attackingTh.textContent = this.capitalizeFirst(attackingTypeName);
            attackingTh.className = `type-header-${attackingTypeName}`; // Tambahkan kelas untuk warna
            row.appendChild(attackingTh);

            this.allTypeNames.forEach(defendingTypeName => {
                const td = document.createElement('td');
                const multiplier = this.typeEffectivenessMatrix[attackingTypeName][defendingTypeName];
                
                td.textContent = multiplier === 1 ? '' : `${multiplier}x`; // Tampilkan 1x sebagai kosong
                
                if (multiplier === 2) {
                    td.classList.add('effectiveness-2x');
                } else if (multiplier === 0.5) {
                    td.classList.add('effectiveness-0-5x');
                } else if (multiplier === 0) {
                    td.classList.add('effectiveness-0x');
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        chartContainer.appendChild(table);
    }

    getTypeIcon(typeName) {
        const icons = {
            'Normal': '⚪', 'Fire': '🔥', 'Water': '💧', 'Electric': '⚡',
            'Grass': '🌱', 'Ice': '❄️', 'Fighting': '👊', 'Poison': '☠️',
            'Ground': '🌍', 'Flying': '🦅', 'Psychic': '🔮', 'Bug': '🐛',
            'Rock': '🪨', 'Ghost': '👻', 'Dragon': '🐉', 'Dark': '🌑',
            'Steel': '⚔️', 'Fairy': '🧚'
        };
        return icons[typeName] || '❓';
    }

    getTypeColor(type) {
        const typeColors = {
            'Normal': '#A8A878', 'Fire': '#F08030', 'Water': '#6890F0', 'Electric': '#F8D030',
            'Grass': '#78C850', 'Ice': '#98D8D8', 'Fighting': '#C03028', 'Poison': '#A040A0',
            'Ground': '#E0C068', 'Flying': '#A890F0', 'Psychic': '#F85888', 'Bug': '#A8B820',
            'Rock': '#B8A038', 'Ghost': '#705898', 'Dragon': '#7038F8', 'Dark': '#705848',
            'Steel': '#B8B8D0', 'Fairy': '#EE99AC'
        };
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        return typeColors[capitalizedType] || '#6C757D';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.pokemonTypesPage = new PokemonTypesPage();
});