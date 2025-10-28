// js/main.js - Version corrigée et simplifiée
class BioLinkApp {
    constructor() {
        this.contacts = {};
        this.stats = {};
        this.comments = [];
        this.init();
    }

    async init() {
        // Chargement IMMÉDIAT de l'interface
        this.setupUI();
        
        // Chargement ASYNCHRONE des données
        this.loadDataAsync();
    }

    async loadDataAsync() {
        try {
            // Un seul appel pour toutes les données
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
        // Mettre à jour TOUTES les stats dynamiques
        document.getElementById('stat-experience').textContent = this.stats.experience || '4+';
        document.getElementById('stat-rating').textContent = `${this.stats.avg_rating || '0'}/5`;
        document.getElementById('stat-clients').textContent = this.stats.satisfied_clients || '0';
        document.getElementById('stat-reviews').textContent = this.stats.total_reviews || '0';
        document.getElementById('comments-count').textContent = this.comments.length;
        
        // Afficher les commentaires
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

        // Commentaires
        document.getElementById('submit-comment').addEventListener('click', () => {
            this.submitComment();
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
            
            // Recharger les données
            await this.loadDataAsync();
            
        } catch (error) {
            alert('Erreur lors de l\'envoi. Veuillez réessayer.');
        }

        // Reset
        document.getElementById('comment-name').value = '';
        document.getElementById('comment-rating').value = '';
        document.getElementById('comment-text').value = '';
    }
}

// Lancement immédiat
document.addEventListener('DOMContentLoaded', () => {
    new BioLinkApp();
});