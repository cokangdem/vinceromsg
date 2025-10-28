// js/main.js - Version corrigée SANS doublon
class BioLinkApp {
    constructor() {
        this.contacts = {};
        this.stats = {};
        this.comments = [];
        this.currentRating = 0;
        this.init();
    }

    async init() {
        // CORRECT : Une seule méthode init()
        this.setupUI();
        await this.trackVisitor(); // ← TRACKER D'ABORD
        this.loadDataAsync();
    }

    async trackVisitor() {
        try {
            await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=trackVisitor`);
        } catch (error) {
            console.log('Tracking échoué');
        }
    }

    async loadDataAsync() {
        try {
            const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getAllData`);
            const data = await response.json();
            
            this.contacts = data.contacts || {};
            this.stats = data.stats || {};
            this.comments = data.comments || [];
            
            this.updateDynamicContent();
            
        } catch (error) {
            console.log('Chargement asynchrone échoué');
        }
    }

    updateDynamicContent() {
        // Mettre à jour TOUTES les stats avec les VRAIES données
        document.getElementById('stat-experience').textContent = this.stats.experience || '--';
        document.getElementById('stat-rating').textContent = `${this.stats.avg_rating || '0'}/5`;
        document.getElementById('stat-clients').textContent = this.stats.satisfied_clients || '0';
        document.getElementById('stat-reviews').textContent = this.stats.total_reviews || '0';
        document.getElementById('comments-count').textContent = this.comments.length;
        
        this.displayComments();
    }

    displayComments() {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;

        commentsList.innerHTML = '';
        
        this.comments.forEach(comment => {
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
            
            commentsList.appendChild(commentElement);
        });
    }

    setupUI() {
        // Contacts protégés
        document.getElementById('show-phone').addEventListener('click', () => {
            this.revealContact('phone');
        });
        
        document.getElementById('show-email').addEventListener('click', () => {
            this.revealContact('email');
        });

        // Système d'étoiles
        this.setupStarRating();
        
        // Commentaires
        document.getElementById('submit-comment').addEventListener('click', () => {
            this.submitComment();
        });
    }

    setupStarRating() {
        const stars = document.querySelectorAll('.star');
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.setRating(rating);
            });
            
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                this.highlightStars(rating);
            });
        });
        
        // Reset au mouseout
        document.querySelector('.stars').addEventListener('mouseout', () => {
            this.highlightStars(this.currentRating);
        });
    }

    setRating(rating) {
        this.currentRating = rating;
        document.getElementById('comment-rating').value = rating;
        this.highlightStars(rating);
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.classList.add('active');
                star.textContent = '★';
            } else {
                star.classList.remove('active');
                star.textContent = '☆';
            }
        });
    }

    revealContact(type) {
        const button = document.getElementById(`show-${type}`);
        let value, icon;
        
        if (type === 'phone') {
            value = this.contacts.phoneFormatted || this.contacts.phone || "Non disponible";
            icon = '📱';
        } else {
            value = this.contacts.email || "Non disponible";
            icon = '✉️';
        }
        
        button.innerHTML = `${icon} ${value}`;
        button.style.backgroundColor = '#28a745';
    }

    async submitComment() {
        const name = document.getElementById('comment-name').value.trim();
        const rating = this.currentRating;
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
            
            // Recharger les données
            await this.loadDataAsync();
            
            // Reset du formulaire
            this.resetForm();
            
        } catch (error) {
            alert('Erreur lors de l\'envoi. Veuillez réessayer.');
        }
    }

    resetForm() {
        document.getElementById('comment-name').value = '';
        document.getElementById('comment-text').value = '';
        this.setRating(0);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new BioLinkApp();
});