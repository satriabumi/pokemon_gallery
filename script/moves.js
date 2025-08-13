// Moves Page JavaScript
class MovesPage {
    constructor() {
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.allMoves = [];
        this.filteredMoves = [];
        this.init();
    }

    init() {
        this.loadMovesData();
        this.setupEventListeners();
    }

    loadMovesData() {
        this.allMoves = [
            {
                name: 'Tackle',
                type: 'Normal',
                power: 40,
                accuracy: 100,
                category: 'Physical',
                description: 'Serangan fisik dasar yang menabrak target dengan tubuh.'
            },
            {
                name: 'Ember',
                type: 'Fire',
                power: 40,
                accuracy: 100,
                category: 'Special',
                description: 'Menembakkan api kecil yang dapat membakar target.'
            },
            {
                name: 'Water Gun',
                type: 'Water',
                power: 40,
                accuracy: 100,
                category: 'Special',
                description: 'Menembakkan air dengan tekanan tinggi ke target.'
            },
            {
                name: 'Vine Whip',
                type: 'Grass',
                power: 45,
                accuracy: 100,
                category: 'Physical',
                description: 'Menggunakan sulur tanaman untuk memukul target.'
            },
            {
                name: 'Thunder Shock',
                type: 'Electric',
                power: 40,
                accuracy: 100,
                category: 'Special',
                description: 'Menembakkan sengatan listrik ringan ke target.'
            },
            {
                name: 'Confusion',
                type: 'Psychic',
                power: 50,
                accuracy: 100,
                category: 'Special',
                description: 'Menggunakan kekuatan psikis untuk menyerang pikiran target.'
            },
            {
                name: 'Rock Throw',
                type: 'Rock',
                power: 50,
                accuracy: 90,
                category: 'Physical',
                description: 'Melempar batu ke target dengan kekuatan yang cukup.'
            },
            {
                name: 'Bite',
                type: 'Dark',
                power: 60,
                accuracy: 100,
                category: 'Physical',
                description: 'Menggigit target dengan gigi yang tajam.'
            },
            {
                name: 'Poison Powder',
                type: 'Poison',
                power: 0,
                accuracy: 75,
                category: 'Status',
                description: 'Menyebarkan serbuk beracun yang dapat meracuni target.'
            },
            {
                name: 'Sleep Powder',
                type: 'Grass',
                power: 0,
                accuracy: 75,
                category: 'Status',
                description: 'Menyebarkan serbuk yang dapat membuat target tertidur.'
            },
            {
                name: 'Thunderbolt',
                type: 'Electric',
                power: 90,
                accuracy: 100,
                category: 'Special',
                description: 'Menembakkan sengatan listrik yang kuat ke target.'
            },
            {
                name: 'Fire Blast',
                type: 'Fire',
                power: 110,
                accuracy: 85,
                category: 'Special',
                description: 'Menembakkan ledakan api yang sangat kuat.'
            },
            {
                name: 'Hydro Pump',
                type: 'Water',
                power: 110,
                accuracy: 80,
                category: 'Special',
                description: 'Menembakkan air dengan tekanan sangat tinggi.'
            },
            {
                name: 'Solar Beam',
                type: 'Grass',
                power: 120,
                accuracy: 100,
                category: 'Special',
                description: 'Mengumpulkan energi matahari untuk serangan yang sangat kuat.'
            },
            {
                name: 'Earthquake',
                type: 'Ground',
                power: 100,
                accuracy: 100,
                category: 'Physical',
                description: 'Mengguncang tanah untuk menyerang semua Pokemon di sekitar.'
            },
            {
                name: 'Psychic',
                type: 'Psychic',
                power: 90,
                accuracy: 100,
                category: 'Special',
                description: 'Menggunakan kekuatan psikis yang kuat untuk menyerang.'
            }
        ];

        this.filteredMoves = [...this.allMoves];
        this.renderMoves();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.filterMoves();
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
                this.filterMoves();
            });
        });
    }

    filterMoves() {
        this.filteredMoves = this.allMoves.filter(move => {
            const matchesSearch = move.name.toLowerCase().includes(this.currentSearch) ||
                                move.type.toLowerCase().includes(this.currentSearch) ||
                                move.description.toLowerCase().includes(this.currentSearch);
            
            const matchesFilter = this.currentFilter === 'all' || 
                                move.category.toLowerCase() === this.currentFilter.toLowerCase();
            
            return matchesSearch && matchesFilter;
        });

        this.renderMoves();
    }

    renderMoves() {
        const movesGrid = document.getElementById('moves-grid');
        if (!movesGrid) return;

        movesGrid.innerHTML = '';

        if (this.filteredMoves.length === 0) {
            movesGrid.innerHTML = `
                <div class="no-results">
                    <h3>Tidak ada jurus ditemukan</h3>
                    <p>Coba ubah kata kunci pencarian atau filter kategori</p>
                </div>
            `;
            return;
        }

        this.filteredMoves.forEach(move => {
            const moveCard = this.createMoveCard(move);
            movesGrid.appendChild(moveCard);
        });
    }

    createMoveCard(move) {
        const card = document.createElement('div');
        card.className = 'move-card';
        
        card.innerHTML = `
            <div class="move-header">
                <span class="move-name">${move.name}</span>
                <span class="move-type type-badge ${move.type.toLowerCase()}" style="background-color: ${this.getTypeColor(move.type)}">${move.type}</span>
            </div>
            <p class="move-description">${move.description}</p>
            <div class="move-stats">
                <div class="move-stat">
                    <span class="move-stat-label">Power</span>
                    <span class="move-stat-value">${move.power}</span>
                </div>
                <div class="move-stat">
                    <span class="move-stat-label">Accuracy</span>
                    <span class="move-stat-value">${move.accuracy}%</span>
                </div>
                <div class="move-stat">
                    <span class="move-stat-label">Category</span>
                    <span class="move-stat-value">${move.category}</span>
                </div>
            </div>
            <div class="move-category ${move.category.toLowerCase()}">${move.category}</div>
        `;

        return card;
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
}

// Initialize Moves page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.movesPage = new MovesPage();
});
