// js/main.js
class BioLinkApp {
    constructor() {
        this.config = {};
        this.stats = {};
        this.init();
    }

    async init() {
        // D'abord tracker le visiteur
        await this.trackVisitor();
        
        // Puis charger les données
        await this.loadConfig();
        await this.loadStats();
        this.setupUI();
        this.setupEventListeners();
        
        window.commentManager = new CommentManager();
    }

    async trackVisitor() {
        try {
            await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=trackVisitor`);
        } catch (error) {
            console.log('Tracking non disponible');
        }
    }

    async loadConfig() {
        try {
            const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getConfig`);
            this.config = await response.json();
            this.updateUserInfo();
        } catch (error) {
            console.error('Erreur chargement config:', error);
        }
    }

    async loadStats() {
        try {
            const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getStats`);
            this.stats = await response.json();
            this.updateStats();
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    }

    updateUserInfo() {
        document.querySelector('.pseudo').textContent = this.config.pseudo || 'Vncrmsg';
        document.querySelector('.profession').textContent = this.config.profession || 'Masseur Professionnel';
        
        // Bio et spécialités
        const bioElement = document.querySelector('.bio');
        if (bioElement && this.config.bio) {
            bioElement.textContent = this.config.bio;
        }
        
        // Ville pour le calculateur de distance
        const cityElement = document.querySelector('.distance-calculator strong');
        if (cityElement && this.config.city) {
            cityElement.textContent = this.config.city;
        }
    }

    updateStats() {
        const statCards = document.querySelectorAll('.stat-card');
        
        // Expérience
        if (statCards[0]) {
            statCards[0].querySelector('.stat-value').textContent = 
                this.stats.experience || '4+';
            statCards[0].querySelector('.stat-label').textContent = 
                'Années d\'expérience';
        }
        
        // Note moyenne
        if (statCards[1]) {
            const rating = this.stats.avg_rating || '0';
            statCards[1].querySelector('.stat-value').textContent = 
                `${rating}/5`;
            statCards[1].querySelector('.stat-label').textContent = 
                'Note moyenne';
        }
        
        // Clients servis (visiteurs 30 derniers jours)
        if (statCards[2]) {
            statCards[2].querySelector('.stat-value').textContent = 
                this.stats.clients_served || '0';
            statCards[2].querySelector('.stat-label').textContent = 
                'Clients satisfaits';
        }
        
        // Avis clients
        if (statCards[3]) {
            statCards[3].querySelector('.stat-value').textContent = 
                this.stats.total_comments || '0';
            statCards[3].querySelector('.stat-label').textContent = 
                'Avis clients';
        }
    }

    setupUI() {
        // Protection des contacts
        document.getElementById('show-phone').addEventListener('click', () => {
            this.revealContact('phone');
        });
        
        document.getElementById('show-email').addEventListener('click', () => {
            this.revealContact('email');
        });

        // Calculateur de distance
        document.getElementById('calculate-distance').addEventListener('click', () => {
            this.calculateDistance();
        });
    }

    revealContact(type) {
        const button = document.getElementById(`show-${type}`);
        let value;
        
        if (type === 'phone') {
            value = this.config.phoneFormatted || 'Non disponible';
        } else {
            value = this.config.email || 'Non disponible';
        }
        
        const icon = type === 'phone' ? '📱' : '✉️';
        button.innerHTML = `${icon} ${value}`;
        button.style.backgroundColor = '#28a745';
    }

    calculateDistance() {
        const userCity = document.getElementById('user-city').value.trim();
        const resultDiv = document.getElementById('distance-result');
        const myCity = this.config.city || 'Paris';
        
        if (!userCity) {
            resultDiv.textContent = 'Veuillez entrer une ville';
            resultDiv.style.color = '#dc3545';
            return;
        }
        
        // Simulation réaliste pour un masseur (rayon d'action)
        const distances = {
            'paris': '0 km (sur place)',
            'lyon': '~400 km (déplacement possible)',
            'marseille': '~700 km (déplacement possible)',
            'bordeaux': '~500 km (déplacement possible)',
            'lille': '~200 km (déplacement possible)'
        };
        
        const normalizedCity = userCity.toLowerCase();
        if (distances[normalizedCity]) {
            resultDiv.textContent = `Distance ${myCity}-${userCity} : ${distances[normalizedCity]}`;
        } else {
            resultDiv.textContent = `Déplacement possible jusqu'à ${userCity} (me consulter)`;
        }
        resultDiv.style.color = '#28a745';
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.bioLinkApp = new BioLinkApp();
});