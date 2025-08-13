// Pokemon Types Page JavaScript
class PokemonTypesPage {
    constructor() {
        this.init();
    }

    init() {
        this.loadTypesData();
        this.renderTypes();
    }

    loadTypesData() {
        this.typesData = [
            {
                name: 'Normal',
                color: '#A8A878',
                description: 'Type yang seimbang dan tidak memiliki kelemahan atau keunggulan khusus.',
                weaknesses: ['Fighting'],
                resistances: [],
                immunities: ['Ghost']
            },
            {
                name: 'Fire',
                color: '#F08030',
                description: 'Type yang kuat melawan Grass, Ice, Bug, dan Steel, tetapi lemah terhadap Water, Ground, dan Rock.',
                weaknesses: ['Water', 'Ground', 'Rock'],
                resistances: ['Fire', 'Grass', 'Ice', 'Bug', 'Steel', 'Fairy'],
                immunities: []
            },
            {
                name: 'Water',
                color: '#6890F0',
                description: 'Type yang efektif melawan Fire, Ground, dan Rock, tetapi lemah terhadap Electric dan Grass.',
                weaknesses: ['Electric', 'Grass'],
                resistances: ['Fire', 'Water', 'Ice', 'Steel'],
                immunities: []
            },
            {
                name: 'Electric',
                color: '#F8D030',
                description: 'Type yang kuat melawan Water dan Flying, tetapi lemah terhadap Ground.',
                weaknesses: ['Ground'],
                resistances: ['Electric', 'Flying', 'Steel'],
                immunities: []
            },
            {
                name: 'Grass',
                color: '#78C850',
                description: 'Type yang efektif melawan Water, Ground, dan Rock, tetapi lemah terhadap banyak type.',
                weaknesses: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'],
                resistances: ['Water', 'Electric', 'Grass', 'Ground'],
                immunities: []
            },
            {
                name: 'Ice',
                color: '#98D8D8',
                description: 'Type yang kuat melawan Grass, Ground, Flying, dan Dragon, tetapi lemah terhadap banyak type.',
                weaknesses: ['Fire', 'Fighting', 'Rock', 'Steel'],
                resistances: ['Ice'],
                immunities: []
            },
            {
                name: 'Fighting',
                color: '#C03028',
                description: 'Type yang efektif melawan Normal, Ice, Rock, Dark, dan Steel, tetapi lemah terhadap Flying, Psychic, dan Fairy.',
                weaknesses: ['Flying', 'Psychic', 'Fairy'],
                resistances: ['Bug', 'Rock', 'Dark'],
                immunities: []
            },
            {
                name: 'Poison',
                color: '#A040A0',
                description: 'Type yang efektif melawan Grass dan Fairy, tetapi lemah terhadap Ground dan Psychic.',
                weaknesses: ['Ground', 'Psychic'],
                resistances: ['Grass', 'Fighting', 'Poison', 'Bug', 'Fairy'],
                immunities: []
            },
            {
                name: 'Ground',
                color: '#E0C068',
                description: 'Type yang kuat melawan Fire, Electric, Poison, Rock, dan Steel, tetapi lemah terhadap Water, Grass, dan Ice.',
                weaknesses: ['Water', 'Grass', 'Ice'],
                resistances: ['Poison', 'Rock'],
                immunities: ['Electric']
            },
            {
                name: 'Flying',
                color: '#A890F0',
                description: 'Type yang efektif melawan Grass, Fighting, dan Bug, tetapi lemah terhadap Electric, Ice, dan Rock.',
                weaknesses: ['Electric', 'Ice', 'Rock'],
                resistances: ['Grass', 'Fighting', 'Bug'],
                immunities: ['Ground']
            },
            {
                name: 'Psychic',
                color: '#F85888',
                description: 'Type yang kuat melawan Fighting dan Poison, tetapi lemah terhadap Bug, Ghost, dan Dark.',
                weaknesses: ['Bug', 'Ghost', 'Dark'],
                resistances: ['Fighting', 'Psychic'],
                immunities: []
            },
            {
                name: 'Bug',
                color: '#A8B820',
                description: 'Type yang efektif melawan Grass, Psychic, dan Dark, tetapi lemah terhadap Fire, Flying, dan Rock.',
                weaknesses: ['Fire', 'Flying', 'Rock'],
                resistances: ['Grass', 'Fighting', 'Ground'],
                immunities: []
            },
            {
                name: 'Rock',
                color: '#B8A038',
                description: 'Type yang kuat melawan Fire, Ice, Flying, dan Bug, tetapi lemah terhadap Water, Grass, Fighting, Ground, dan Steel.',
                weaknesses: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'],
                resistances: ['Normal', 'Fire', 'Poison', 'Flying'],
                immunities: []
            },
            {
                name: 'Ghost',
                color: '#705898',
                description: 'Type yang efektif melawan Ghost dan Psychic, tetapi lemah terhadap Ghost dan Dark.',
                weaknesses: ['Ghost', 'Dark'],
                resistances: ['Poison', 'Bug'],
                immunities: ['Normal', 'Fighting']
            },
            {
                name: 'Dragon',
                color: '#7038F8',
                description: 'Type yang kuat melawan Dragon, tetapi lemah terhadap Ice, Dragon, dan Fairy.',
                weaknesses: ['Ice', 'Dragon', 'Fairy'],
                resistances: ['Fire', 'Water', 'Electric', 'Grass'],
                immunities: []
            },
            {
                name: 'Dark',
                color: '#705848',
                description: 'Type yang efektif melawan Ghost dan Psychic, tetapi lemah terhadap Fighting, Bug, dan Fairy.',
                weaknesses: ['Fighting', 'Bug', 'Fairy'],
                resistances: ['Ghost', 'Dark'],
                immunities: ['Psychic']
            },
            {
                name: 'Steel',
                color: '#B8B8D0',
                description: 'Type yang sangat resistan terhadap banyak serangan, tetapi lemah terhadap Fire, Fighting, dan Ground.',
                weaknesses: ['Fire', 'Fighting', 'Ground'],
                resistances: ['Normal', 'Grass', 'Ice', 'Flying', 'Psychic', 'Bug', 'Rock', 'Dragon', 'Steel', 'Fairy'],
                immunities: ['Poison']
            },
            {
                name: 'Fairy',
                color: '#EE99AC',
                description: 'Type yang efektif melawan Fighting, Dragon, dan Dark, tetapi lemah terhadap Poison dan Steel.',
                weaknesses: ['Poison', 'Steel'],
                resistances: ['Fighting', 'Bug', 'Dark'],
                immunities: ['Dragon']
            }
        ];
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
            <p class="type-description">${type.description}</p>
            <div class="type-effectiveness">
                <div class="effectiveness-group">
                    <h4>Lemah Terhadap</h4>
                    <div class="effectiveness-list">
                        ${weaknesses || '<span class="effectiveness-badge" style="background-color: #6C757D;">Tidak Ada</span>'}
                    </div>
                </div>
                <div class="effectiveness-group">
                    <h4>Kebal Terhadap</h4>
                    <div class="effectiveness-list">
                        ${resistances || '<span class="effectiveness-badge" style="background-color: #6C757D;">Tidak Ada</span>'}
                    </div>
                </div>
                ${type.immunities.length > 0 ? `
                <div class="effectiveness-group">
                    <h4>Kebal Total</h4>
                    <div class="effectiveness-list">
                        ${immunities}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        return card;
    }

    getTypeIcon(typeName) {
        const icons = {
            'Normal': '⚪',
            'Fire': '🔥',
            'Water': '💧',
            'Electric': '⚡',
            'Grass': '🌱',
            'Ice': '❄️',
            'Fighting': '👊',
            'Poison': '☠️',
            'Ground': '🌍',
            'Flying': '🦅',
            'Psychic': '🔮',
            'Bug': '🐛',
            'Rock': '🪨',
            'Ghost': '👻',
            'Dragon': '🐉',
            'Dark': '🌑',
            'Steel': '⚔️',
            'Fairy': '🧚'
        };
        
        return icons[typeName] || '❓';
    }

    getTypeColor(type) {
        const typeColors = {
            'Normal': '#A8A878',
            'Fire': '#F08030',
            'Water': '#6890F0',
            'Electric': '#F8D030',
            'Grass': '#78C850',
            'Ice': '#98D8D8',
            'Fighting': '#C03028',
            'Poison': '#A040A0',
            'Ground': '#E0C068',
            'Flying': '#A890F0',
            'Psychic': '#F85888',
            'Bug': '#A8B820',
            'Rock': '#B8A038',
            'Ghost': '#705898',
            'Dragon': '#7038F8',
            'Dark': '#705848',
            'Steel': '#B8B8D0',
            'Fairy': '#EE99AC'
        };
        
        return typeColors[type] || '#6C757D';
    }
}

// Initialize Pokemon Types page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pokemonTypesPage = new PokemonTypesPage();
});
