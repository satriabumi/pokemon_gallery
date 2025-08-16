class HomePage {
    constructor() {
        // URL PokeAPI
        this.baseApiUrl = 'https://pokeapi.co/api/v2';
        // ID Pokémon populer - termasuk berbagai type
        this.popularPokemonIds = [25, 1, 4, 7, 150, 448, 94, 149, 74, 197, 35];
        // array untuk menyimpan data Pokémon yang diambil
        this.pokemonData = [];
        // inisialisasi halaman
        this.init();
    }

    init() {
        console.log('HomePage init() called');
        console.log('Protocol:', window.location.protocol);
        
        // cek protokol URL untuk menentukan apakah bisa memanggil API
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            console.log('Attempting API integration...');
            // coba ambil data dari API, jika gagal, gunakan data fallback
            this.loadPopularPokemon().catch(() => {
                console.log('API failed, using fallback');
                this.loadFallbackData();
            });
        } else {
            // jika protokol file:// (dibuka langsung dari lokal), gunakan data fallback
            console.log('Using fallback data for file:// protocol');
            this.loadFallbackData();
        }
    }

    async loadPopularPokemon() {
        console.log('Loading Pokemon from API...');
        this.showLoading(); // Tampilkan indikator loading
        
        try {
            // ambil data 3 Pokémon pertama dari API untuk uji coba
            const testIds = [25, 1, 4]; // Pikachu, Bulbasaur, Charmander
            // buat array dari promise untuk setiap panggilan API
            const pokemonPromises = testIds.map(id => this.fetchPokemonData(id));
            
            console.log('Fetching Pokemon:', testIds);
            // tunggu semua promise selesai (baik berhasil atau gagal)
            const pokemonResults = await Promise.allSettled(pokemonPromises);
            console.log('API Results:', pokemonResults);
            
            // filter hasil yang berhasil (status 'fulfilled')
            const successfulResults = pokemonResults.filter(result => result.status === 'fulfilled');
            
            // Jika tidak ada panggilan API yang berhasil, lempar error
            if (successfulResults.length === 0) {
                throw new Error('No successful API calls');
            }
            
            // ambil nilai data dari hasil yang berhasil
            this.pokemonData = successfulResults.map(result => result.value);
            
            // tambahkan data fallback untuk mengisi sisa slot (total 6 Pokémon)
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
            
            this.renderPokemonCards(); // render kartu Pokémon
            this.setupPokemonCards(); // siapkan event listener untuk kartu
            this.hideLoading(); // sembunyikan indikator loading
            
            console.log('API integration successful!');
            
        } catch (error) {
            console.error('API Error:', error);
            throw error; // lempar error kembali untuk memicu fallback di init()
        }
    }

    async fetchPokemonData(id) {
        try {
            console.log(`Fetching Pokemon ID: ${id}`);
            
            // Buat AbortController untuk timeout permintaan
            const controller = new AbortController();
            // Set timeout 5 detik, jika lewat, batalkan permintaan
            const timeoutId = setTimeout(() => controller.abort(), 5000); 
            
            // Lakukan permintaan fetch ke API
            const response = await fetch(`${this.baseApiUrl}/pokemon/${id}`, {
                signal: controller.signal, // Kaitkan signal dengan controller
                method: 'GET',
                mode: 'cors'
            });
            
            clearTimeout(timeoutId); // Hapus timeout jika permintaan selesai sebelum waktu habis
            
            // Jika respons tidak OK (misal 404, 500), lempar error
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const pokemon = await response.json(); // Parse respons JSON
            console.log(`Successfully fetched: ${pokemon.name}`);
            
            // Kembalikan objek Pokémon yang diformat
            return {
                id: pokemon.id,
                name: this.capitalizeFirst(pokemon.name),
                types: pokemon.types.map(type => this.capitalizeFirst(type.type.name)),
                // Ambil gambar artwork resmi, jika tidak ada, gunakan gambar default
                image: pokemon.sprites.other['official-artwork'].front_default || 
                       pokemon.sprites.front_default,
                stats: {
                    // Cari dan ambil nilai HP dan Attack
                    hp: pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat,
                    attack: pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat
                }
            };
        } catch (error) {
            console.error(`Error fetching Pokemon ${id}:`, error);
            throw error; // Lempar error untuk ditangani di pemanggil
        }
    }

    // Fungsi untuk mengubah huruf pertama string menjadi kapital
    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    loadFallbackData() {
        console.log('Loading fallback data...');
        this.showLoading(); // Tampilkan indikator loading
        
        // Data Pokémon statis yang akan digunakan sebagai fallback
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
            },
            {
                id: 94,
                name: 'Gengar',
                types: ['Ghost', 'Poison'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
                stats: { hp: 60, attack: 65 }
            },
            {
                id: 149,
                name: 'Dragonite',
                types: ['Dragon', 'Flying'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
                stats: { hp: 91, attack: 134 }
            },
            {
                id: 74,
                name: 'Geodude',
                types: ['Rock', 'Ground'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png',
                stats: { hp: 40, attack: 80 }
            },
            {
                id: 197,
                name: 'Umbreon',
                types: ['Dark'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png',
                stats: { hp: 95, attack: 65 }
            },
            {
                id: 35,
                name: 'Clefairy',
                types: ['Fairy'],
                image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/35.png',
                stats: { hp: 70, attack: 45 }
            }
        ];
        
        // Simulasikan waktu loading dengan setTimeout
        setTimeout(() => {
            this.renderPokemonCards(); // Render kartu Pokémon
            this.setupPokemonCards(); // Siapkan event listener untuk kartu
            this.hideLoading(); // Sembunyikan indikator loading
        }, 1500); // Tunda 1.5 detik
    }

    renderPokemonCards() {
        console.log('Rendering Pokemon cards...');
        const grid = document.getElementById('pokemonGrid'); // Dapatkan elemen grid
        if (!grid) {
            console.error('pokemonGrid not found!');
            return;
        }

        // buat HTML untuk setiap kartu Pokémon dan masukkan ke dalam grid
        grid.innerHTML = this.pokemonData.map(pokemon => `
            <div class="pokemon-card" data-pokemon-id="${pokemon.id}">
                <div class="pokemon-card-header">
                    <span class="pokemon-id">#${this.formatPokemonId(pokemon.id)}</span>
                    <div class="pokemon-image">
                        <img src="${pokemon.image}" alt="${pokemon.name}" 
                             onerror="this.src='assets/img/icon/pokemon-placeholder.png'" // Gambar fallback jika error
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

    // tampilkan indikator loading dan sembunyikan grid/error
    showLoading() {
        const loading = document.getElementById('pokemonLoading');
        const grid = document.getElementById('pokemonGrid');
        const error = document.getElementById('pokemonError');
        
        if (loading) loading.style.display = 'block';
        if (grid) grid.style.display = 'none';
        if (error) error.style.display = 'none';
    }

    // hide indikator loading dan tampilkan grid
    hideLoading() {
        const loading = document.getElementById('pokemonLoading');
        const grid = document.getElementById('pokemonGrid');
        
        if (loading) loading.style.display = 'none';
        if (grid) grid.style.display = 'grid';
    }

    setupPokemonCards() {
        // sedikit jeda untuk memastikan kartu sudah dirender di DOM
        setTimeout(() => {
            // tambahkan event listener 'click' ke setiap kartu Pokémon
            document.querySelectorAll('.pokemon-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    console.log('Card clicked:', card.dataset.pokemonId);
                    const pokemonId = card.getAttribute('data-pokemon-id');
                    // arahkan ke halaman detail dengan ID Pokémon sebagai parameter URL
                    window.location.href = `detailpokemon.html?id=${pokemonId}`;
                });
            });
        }, 100);
    }

    // format ID Pokémon menjadi 3 digit (misal: 1 -> 001, 25 -> 025)
    formatPokemonId(id) {
        return id.toString().padStart(3, '0');
    }
}

// jalankan kode setelah seluruh DOM halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting Pokemon Gallery...');
    
    // pastikan elemen grid ada sebelum inisialisasi
    const pokemonGrid = document.getElementById('pokemonGrid');
    if (!pokemonGrid) {
        console.error('pokemonGrid element not found!');
        return;
    }
    
    // buat instance HomePage untuk memulai aplikasi
    window.homePage = new HomePage();
    console.log('HomePage initialized successfully');
});