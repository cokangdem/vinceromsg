// js/main.js
class BioLinkApp {
    constructor() {
        this.userData = {};
        this.statsData = {};
        this.init();
    }

    async init() {
        // D'abord tracker le visiteur
        await this.trackVisitor();
        
        // Puis charger les données
        await this.loadUserData();
        await this.loadStats();
        this.setupUI();
        
        // Initialiser les commentaires
        window.commentManager = new CommentManager();
    }

    async trackVisitor() {
        try {
            await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=trackVisitor`);
        } catch (error) {
            console.log('Tracking non disponible');
        }
    }

    async loadUserData() {
        try {
            const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getConfig`);
            this.userData = await response.json();
            this.updateUserInfo();
        } catch (error) {
            console.error('Erreur chargement config:', error);
            // Fallback avec des données basiques
            this.userData = {
                pseudo: "Vncrmsg",
                profession: "Masseur Professionnel",
                city: "Paris, France",
                bio: "Passionné par le bien-être et la relaxation...",
                phoneFormatted: "+33 6 38 20 23 99",
                email: "votre@email.com"
            };
            this.updateUserInfo();
        }
    }

    async loadStats() {
        try {
            const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getStats`);
            this.statsData = await response.json();
            this.updateStats();
        } catch (error) {
            console.error('Erreur chargement stats:', error);
            // Fallback
            this.statsData = {
                experience: "4+",
                avg_rating: "4.8",
                clients_served: "0",
                total_comments: "0"
            };
            this.updateStats();
        }
    }

    updateUserInfo() {
        // Avatar
        const avatar = document.querySelector('.avatar');
        if (avatar && this.userData.avatar) {
            avatar.src = this.userData.avatar;
        }
        
        // Informations personnelles
        document.querySelector('.pseudo').textContent = this.userData.pseudo || "Vncrmsg";
        document.querySelector('.profession').textContent = this.userData.profession || "Masseur Professionnel";
        
        // Bio
        const bioElement = document.querySelector('.bio');
        if (bioElement) {
            bioElement.textContent = this.userData.bio || "Spécialiste en massage bien-être et relaxation.";
        }
        
        // Ville pour le calculateur de distance
        const cityElement = document.querySelector('.my-city');
        if (cityElement) {
            cityElement.textContent = this.userData.city || "Paris, France";
        }
    }

    updateStats() {
        const statCards = document.querySelectorAll('.stat-card');
        
        if (statCards[0]) {
            statCards[0].querySelector('.stat-value').textContent = this.statsData.experience || "4+";
            statCards[0].querySelector('.stat-label').textContent = "Années d'expérience";
        }
        
        if (statCards[1]) {
            const rating = this.statsData.avg_rating || "4.8";
            statCards[1].querySelector('.stat-value').textContent = `${rating}/5`;
            statCards[1].querySelector('.stat-label').textContent = "Note moyenne";
        }
        
        if (statCards[2]) {
            statCards[2].querySelector('.stat-value').textContent = this.statsData.clients_served || "0";
            statCards[2].querySelector('.stat-label').textContent = "Clients satisfaits";
        }
        
        if (statCards[3]) {
            statCards[3].querySelector('.stat-value').textContent = this.statsData.total_comments || "0";
            statCards[3].querySelector('.stat-label').textContent = "Avis clients";
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
        let value, icon;
        
        if (type === 'phone') {
            value = this.userData.phoneFormatted || this.userData.phone || "Non disponible";
            icon = '📱';
        } else {
            value = this.userData.email || "Non disponible";
            icon = '✉️';
        }
        
        button.innerHTML = `${icon} ${value}`;
        button.style.backgroundColor = '#28a745';
    }

    calculateDistance() {
        const userCity = document.getElementById('user-city').value.trim();
        const resultDiv = document.getElementById('distance-result');
        const myCity = this.userData.city || "Paris";
        
        if (!userCity) {
            resultDiv.textContent = 'Veuillez entrer une ville';
            resultDiv.style.color = '#dc3545';
            return;
        }
        
        // Simulation réaliste
        const distances = {
            'paris': '0 km (sur place)',
            'lyon': '~400 km (déplacement possible)',
            'marseille': '~700 km (déplacement possible)',
            'bordeaux': '~500 km (déplacement possible)',
            'lille': '~200 km (déplacement possible)',
            'toulouse': '~600 km (déplacement possible)'
        };
        
        const normalizedCity = userCity.toLowerCase();
        if (distances[normalizedCity]) {
            resultDiv.textContent = `Distance ${myCity} - ${userCity} : ${distances[normalizedCity]}`;
        } else {
            resultDiv.textContent = `Déplacement possible jusqu'à ${userCity} (me consulter pour les tarifs)`;
        }
        resultDiv.style.color = '#28a745';
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.bioLinkApp = new BioLinkApp();
});