// Moves Page JavaScript
class MovesPage {
    constructor() {
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.allMoves = [];
        this.filteredMoves = [];
        this.movesGrid = document.getElementById('moves-grid'); // Cache elemen grid

        // Mengikat (bind) metode ke instance class untuk memastikan konteks 'this' yang benar
        this.loadMovesData = this.loadMovesData.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.filterMoves = this.filterMoves.bind(this);
        this.renderMoves = this.renderMoves.bind(this);
        this.createMoveCard = this.createMoveCard.bind(this);
        this.getTypeColor = this.getTypeColor.bind(this);

        this.init();
    }

    init() {
        this.loadMovesData();
        this.setupEventListeners();
    }

    async loadMovesData() {
        if (!this.movesGrid) return;

        this.showLoading();

        try {
            // Cek apakah data sudah ada di localStorage dan masih valid (kurang dari 24 jam)
            const cachedData = localStorage.getItem('pokemonMoves');
            const cacheTimestamp = localStorage.getItem('pokemonMovesTimestamp');
            const now = Date.now();
            const cacheValid = cacheTimestamp && (now - parseInt(cacheTimestamp) < 86400000); // 24 jam

            if (cachedData && cacheValid) {
                console.log('Menggunakan data moves dari cache');
                this.allMoves = JSON.parse(cachedData);
                this.filteredMoves = [...this.allMoves];
                this.renderMoves();
                this.hideLoading();
                return;
            }

            const response = await fetch('https://pokeapi.co/api/v2/move?limit=100'); // Batasi ke 100 moves
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const moveUrls = data.results.map(move => move.url);

            // Gunakan Promise.allSettled untuk menghindari kegagalan total jika ada request yang gagal
            const moveDetailsPromises = moveUrls.map(url => fetch(url).then(res => res.json()));
            const detailedMovesResults = await Promise.allSettled(moveDetailsPromises);

            this.allMoves = detailedMovesResults
                .filter(result => result.status === 'fulfilled')
                .map(result => {
                    const moveData = result.value;
                    let description = 'Tidak ada deskripsi.';
                    
                    // Penanganan yang lebih robust untuk effect entries
                    if (moveData.effect_entries && moveData.effect_entries.length > 0) {
                        const descriptionEntry = moveData.effect_entries.find(entry => 
                            entry.language && entry.language.name === 'en'
                        );
                        description = descriptionEntry ? descriptionEntry.short_effect : moveData.effect_entries[0].short_effect || description;
                    }

                    // Pastikan property damage_class ada
                    const category = (moveData.damage_class && moveData.damage_class.name) ? 
                        moveData.damage_class.name : 'status';

                    return {
                        name: moveData.name.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                        type: moveData.type ? moveData.type.name : 'normal',
                        power: moveData.power !== null ? moveData.power : '—',
                        accuracy: moveData.accuracy !== null ? moveData.accuracy : '—',
                        category: category,
                        description: description
                    };
                });

            // Simpan di localStorage untuk caching
            try {
                localStorage.setItem('pokemonMoves', JSON.stringify(this.allMoves));
                localStorage.setItem('pokemonMovesTimestamp', now.toString());
            } catch (e) {
                console.warn('Gagal menyimpan cache:', e);
            }

            this.filteredMoves = [...this.allMoves];
            this.renderMoves();
            this.hideLoading();

        } catch (error) {
            console.error('Gagal memuat data jurus:', error);
            this.hideLoading();
            this.movesGrid.innerHTML = `
                <div class="error-message">
                    <h3>Gagal memuat jurus</h3>
                    <p>Terjadi kesalahan saat mengambil data dari PokeAPI. Silakan coba lagi nanti.</p>
                </div>
            `;
        }
    }

    setupEventListeners() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.filterMoves();
            });
        }

        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                this.currentFilter = e.target.dataset.type;
                this.filterMoves();
            });
        });
    }

    filterMoves() {
        if (!this.allMoves || this.allMoves.length === 0) {
            this.filteredMoves = [];
            return;
        }

        this.filteredMoves = this.allMoves.filter(move => {
            try {
                // Lebih defensive dengan pengecekan null/undefined
                const moveName = (move.name || '').toLowerCase();
                const moveType = (move.type || '').toLowerCase();
                const moveDesc = (move.description || '').toLowerCase();
                const moveCategory = (move.category || '').toLowerCase();
                
                const searchTerm = this.currentSearch.toLowerCase();
                
                const matchesSearch = searchTerm === '' || 
                    moveName.includes(searchTerm) ||
                    moveType.includes(searchTerm) || 
                    moveDesc.includes(searchTerm);
                
                const matchesFilter = this.currentFilter === 'all' || 
                    moveCategory === this.currentFilter.toLowerCase();
                
                return matchesSearch && matchesFilter;
            } catch (e) {
                console.error('Error filtering move:', move, e);
                return false;
            }
        });

        this.renderMoves();
    }

    renderMoves() {
        // Selalu dapatkan element terbaru untuk menghindari reference yang tidak valid
        const movesGrid = document.getElementById('moves-grid');
        if (!movesGrid) {
            console.error('Moves grid element not found');
            return;
        }

        movesGrid.innerHTML = '';

        // Handling untuk jika filtered moves kosong
        if (!this.filteredMoves || this.filteredMoves.length === 0) {
            movesGrid.innerHTML = `
                <div class="no-results">
                    <h3>Tidak ada jurus ditemukan</h3>
                    <p>Coba ubah kata kunci pencarian atau filter kategori</p>
                </div>
            `;
            return;
        }

        // Membuat fragment untuk mengurangi DOM reflow
        const fragment = document.createDocumentFragment();
        
        this.filteredMoves.forEach(move => {
            try {
                const moveCard = this.createMoveCard(move);
                fragment.appendChild(moveCard);
            } catch (e) {
                console.error('Error creating card for move:', move, e);
            }
        });

        // Append semua card sekaligus
        movesGrid.appendChild(fragment);
    }

    createMoveCard(move) {
        if (!move) {
            console.error('Attempted to create card with undefined move');
            return document.createElement('div'); // Return empty div to prevent errors
        }
        
        const card = document.createElement('div');
        card.className = 'move-card';
        
        // Sanitasi data untuk mencegah XSS dan error
        const sanitize = (str) => {
            if (str === undefined || str === null) return '';
            return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };
        
        // Validasi semua property untuk mencegah error rendering
        const name = sanitize(move.name || 'Unknown Move');
        const type = (move.type || 'normal').toLowerCase();
        const description = sanitize(move.description || 'No description available');
        const power = move.power !== undefined ? sanitize(move.power) : '—';
        const accuracy = move.accuracy !== undefined ? sanitize(move.accuracy) : '—';
        const category = (move.category || 'status').toLowerCase();
        
        card.innerHTML = `
            <div class="move-header">
                <span class="move-name">${name}</span>
                <span class="move-type type-badge ${type}" style="background-color: ${this.getTypeColor(type)}">${type}</span>
            </div>
            <p class="move-description">${description}</p>
            <div class="move-stats">
                <div class="move-stat">
                    <span class="move-stat-label">Power</span>
                    <span class="move-stat-value">${power}</span>
                </div>
                <div class="move-stat">
                    <span class="move-stat-label">Accuracy</span>
                    <span class="move-stat-value">${accuracy}${accuracy !== '—' ? '%' : ''}</span>
                </div>
                <div class="move-stat">
                    <span class="move-stat-label">Category</span>
                    <span class="move-stat-value">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </div>
            </div>
            <div class="move-category ${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
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

    showLoading() {
        const loading = document.getElementById('movesLoading');
        if (loading) loading.style.display = 'flex';
        if (this.movesGrid) this.movesGrid.innerHTML = '';
    }

    hideLoading() {
        const loading = document.getElementById('movesLoading');
        if (loading) loading.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.movesPage = new MovesPage();
});