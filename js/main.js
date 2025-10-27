// js/main.js - Version complète et corrigée
class BioLinkApp {
    constructor() {
        this.userData = {};
        this.statsData = {};
        this.commentsData = [];
        this.init();
    }

    async init() {
        // Chargement PARALLÈLE de toutes les données
        await Promise.all([
            this.trackVisitor(),
            this.loadAllData()
        ]);
        
        this.setupUI();
    }

    async loadAllData() {
        try {
            // Charger toutes les données en une seule fois si possible, sinon en parallèle
            const [userResponse, statsResponse, commentsResponse] = await Promise.all([
                fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getConfig`).catch(() => ({})),
                fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getStats`).catch(() => ({})),
                fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getComments`).catch(() => ({}))
            ]);

            this.userData = userResponse.ok ? await userResponse.json() : this.getFallbackUserData();
            this.statsData = statsResponse.ok ? await statsResponse.json() : this.getFallbackStats();
            this.commentsData = commentsResponse.ok ? await commentsResponse.json() : [];

            this.updateAllUI();

        } catch (error) {
            console.error('Erreur chargement données:', error);
            this.userData = this.getFallbackUserData();
            this.statsData = this.getFallbackStats();
            this.updateAllUI();
        }
    }

    getFallbackUserData() {
        return {
            pseudo: "Vncrmsg",
            profession: "Masseur Professionnel",
            city: "Vienne (38)",
            bio: "Spécialiste en massage bien-être et relaxation.",
            phoneFormatted: "+33 6 38 20 23 99",
            email: "votre@email.com",
            intervention_radius: "30"
        };
    }

    getFallbackStats() {
        return {
            experience: "4+",
            avg_rating: "0",
            satisfied_clients: "0",
            total_reviews: "0"
        };
    }

    updateAllUI() {
        this.updateUserInfo();
        this.updateStats();
        this.displayComments();
    }

    updateUserInfo() {
        document.querySelector('.pseudo').textContent = this.userData.pseudo;
        document.querySelector('.profession').textContent = this.userData.profession;
        document.querySelector('.bio').textContent = this.userData.bio;
        
        // Mettre à jour la carte de localisation
        const cityElement = document.querySelector('.my-city');
        const radiusElement = document.getElementById('intervention-radius');
        
        if (cityElement) {
            cityElement.textContent = this.userData.city;
        }
        if (radiusElement) {
            radiusElement.textContent = this.userData.intervention_radius || "30";
        }
    }

    updateStats() {
        const statCards = document.querySelectorAll('.stat-card');
        
        // Calculer les vraies stats basées sur les commentaires
        const stats = this.calculateRealStats();
        
        if (statCards[0]) {
            statCards[0].querySelector('.stat-value').textContent = stats.experience;
            statCards[0].querySelector('.stat-label').textContent = "Années d'expérience";
        }
        
        if (statCards[1]) {
            statCards[1].querySelector('.stat-value').textContent = `${stats.avg_rating}/5`;
            statCards[1].querySelector('.stat-label').textContent = "Note moyenne";
        }
        
        if (statCards[2]) {
            statCards[2].querySelector('.stat-value').textContent = stats.satisfied_clients;
            statCards[2].querySelector('.stat-label').textContent = "Clients satisfaits";
        }
        
        if (statCards[3]) {
            statCards[3].querySelector('.stat-value').textContent = stats.total_reviews;
            statCards[3].querySelector('.stat-label').textContent = "Avis clients";
        }
    }

    calculateRealStats() {
        // Calculer la vraie moyenne des notes
        const ratings = this.commentsData
            .filter(comment => comment.rating)
            .map(comment => parseInt(comment.rating));
        
        const avgRating = ratings.length > 0 
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
            : "0";

        // Clients satisfaits = commentaires avec 3 étoiles ou plus
        const satisfiedClients = this.commentsData
            .filter(comment => comment.rating && parseInt(comment.rating) >= 3)
            .length;

        return {
            experience: this.statsData.experience || "4+",
            avg_rating: avgRating,
            satisfied_clients: satisfiedClients,
            total_reviews: this.commentsData.length
        };
    }

    displayComments() {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;

        commentsList.innerHTML = '';
        
        this.commentsData.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
    }

    createCommentElement(comment) {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        let stars = '';
        if (comment.rating) {
            for (let i = 0; i < 5; i++) {
                stars += i < parseInt(comment.rating) ? '★' : '☆';
            }
        }
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">${comment.name}</div>
                <div class="comment-date">${new Date(comment.date).toLocaleDateString('fr-FR')}</div>
            </div>
            ${comment.rating ? `<div class="comment-rating">${stars}</div>` : ''}
            <div class="comment-text">${comment.text}</div>
        `;
        
        return commentElement;
    }

    async trackVisitor() {
        try {
            await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=trackVisitor`);
        } catch (error) {
            // Silencieux en cas d'erreur
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

        // Gestion du calculateur de distance
        document.getElementById('distance-toggle').addEventListener('click', () => {
            this.toggleDistanceCalculator();
        });
        
        document.getElementById('calculate-distance').addEventListener('click', () => {
            this.calculateDistance();
        });
        
        // Enter key pour le calcul
        document.getElementById('user-city').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculateDistance();
            }
        });

        // Gestion des commentaires
        document.getElementById('submit-comment').addEventListener('click', () => {
            this.submitComment();
        });
    }

    toggleDistanceCalculator() {
        const form = document.getElementById('distance-form');
        const toggle = document.getElementById('distance-toggle');
        
        if (form.classList.contains('hidden')) {
            form.classList.remove('hidden');
            form.classList.add('visible');
            toggle.innerHTML = '📏 Masquer le calculateur';
            document.getElementById('user-city').focus();
        } else {
            form.classList.remove('visible');
            form.classList.add('hidden');
            toggle.innerHTML = '📏 Vérifier la distance depuis votre ville';
        }
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

    async calculateDistance() {
        const userCity = document.getElementById('user-city').value.trim();
        const resultDiv = document.getElementById('distance-result');
        const myCity = this.userData.city || "Vienne (38)";
        
        if (!userCity) {
            resultDiv.textContent = 'Veuillez entrer une ville';
            resultDiv.style.color = '#dc3545';
            return;
        }
        
        // Message de chargement
        resultDiv.textContent = 'Calcul en cours...';
        resultDiv.style.color = '#666';
        
        try {
            // Utilisation de l'API OpenRouteService (gratuite)
            const distance = await this.calculateRealDistance(myCity, userCity);
            
            if (distance) {
                resultDiv.innerHTML = `
                    <div style="color: #28a745;">
                        <strong>Distance approximative :</strong><br>
                        ${myCity} ↔ ${userCity}<br>
                        <span style="font-size: 1.2em;">${distance} km</span>
                    </div>
                `;
            } else {
                throw new Error('Calcul impossible');
            }
            
        } catch (error) {
            // Fallback : calcul approximatif basé sur des distances connues
            const approximateDistance = this.getApproximateDistance(myCity, userCity);
            
            if (approximateDistance) {
                resultDiv.innerHTML = `
                    <div style="color: #28a745;">
                        <strong>Distance approximative :</strong><br>
                        ${myCity} ↔ ${userCity}<br>
                        <span style="font-size: 1.2em;">${approximateDistance} km</span>
                        <br><small style="color: #666;">(estimation)</small>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div style="color: #666;">
                        <strong>Distance :</strong><br>
                        ${myCity} ↔ ${userCity}<br>
                        <span>Calcul direct impossible</span>
                        <br><small>Utilisez Google Maps pour une distance précise</small>
                    </div>
                `;
            }
        }
    }

    // Méthode avec API (optionnelle)
    async calculateRealDistance(city1, city2) {
        // Cette méthode utilise une API gratuite - à implémenter si besoin
        // Pour l'instant, on utilise l'approximation
        return null;
    }

    // Méthode d'approximation basée sur des distances connues
    getApproximateDistance(myCity, userCity) {
        // Récupérer juste le nom principal de la ville (sans le code postal)
        const myCityName = myCity.split('(')[0].split('-')[0].trim().toLowerCase();
        const userCityName = userCity.split('(')[0].split('-')[0].trim().toLowerCase();
        
        // Distances approximatives depuis Vienne (38)
        const distancesFromVienne = {
            // Villes en Auvergne-Rhône-Alpes
            'lyon': '30',
            'grenoble': '80',
            'valence': '70',
            'saint étienne': '90',
            'annecy': '140',
            'chambéry': '110',
            
            // Villes proches dans la région
            ' Bourgoin-jallieu': '40',
            'villeurbanne': '35',
            'vénissieux': '35',
            'saint-priest': '35',
            'meyzieu': '35',
            'saint-quentin-fallavier': '25',
            'l\'isle d\'abeau': '20',
            'la côte saint andré': '25',
            'beaurepaire': '30',
            'russille': '15',
            
            // Autres grandes villes françaises
            'paris': '480',
            'marseille': '300',
            'toulouse': '450',
            'nice': '350',
            'nantes': '550',
            'bordeaux': '500',
            'lille': '600',
            'strasbourg': '500'
        };
        
        // Chercher la ville dans la liste
        for (const [city, distance] of Object.entries(distancesFromVienne)) {
            if (userCityName.includes(city) || city.includes(userCityName)) {
                return distance;
            }
        }
        
        return null;
    }

    async submitComment() {
        const name = document.getElementById('comment-name').value.trim();
        const rating = document.getElementById('comment-rating').value;
        const text = document.getElementById('comment-text').value.trim();
        
        if (!name || !text) {
            alert('Veuillez remplir au moins votre nom et votre commentaire');
            return;
        }

        try {
            const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=addComment`, {
                method: 'POST',
                body: JSON.stringify({ name, rating, text })
            });
            
            const result = await response.json();
            alert(result.message);
            
            // Recharger toutes les données pour mettre à jour les stats
            await this.loadAllData();
            
        } catch (error) {
            alert('Erreur lors de l\'envoi. Veuillez réessayer.');
        }

        // Reset du formulaire
        document.getElementById('comment-name').value = '';
        document.getElementById('comment-rating').value = '';
        document.getElementById('comment-text').value = '';
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.bioLinkApp = new BioLinkApp();
});