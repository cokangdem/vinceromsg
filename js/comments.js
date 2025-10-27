// Gestion des commentaires
class CommentManager {
    constructor() {
        this.comments = [];
        this.init();
    }

    async init() {
        await this.loadComments();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('submit-comment').addEventListener('click', () => {
            this.submitComment();
        });
    }

    async submitComment() {
        const name = document.getElementById('comment-name').value.trim();
        const rating = document.getElementById('comment-rating').value;
        const text = document.getElementById('comment-text').value.trim();
        
        if (!name || !text) {
            alert('Veuillez remplir au moins votre nom et votre commentaire');
            return;
        }

        const commentData = { name, rating, text };

        try {
            // Essayer d'envoyer au backend
            await this.sendToBackend(commentData);
        } catch (error) {
            // Fallback : stockage local
            this.saveLocalComment(commentData);
        }

        this.resetForm();
        await this.loadComments();
        alert('Merci pour votre commentaire !');
    }

    async sendToBackend(commentData) {
        // À adapter selon votre solution backend
        const response = await fetch(CONFIG.COMMENTS.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });

        if (!response.ok) {
            throw new Error('Erreur backend');
        }
    }

    saveLocalComment(commentData) {
        const comments = this.getLocalComments();
        comments.unshift({
            id: Date.now(),
            date: new Date().toISOString(),
            ...commentData
        });
        localStorage.setItem('bioLinkComments', JSON.stringify(comments));
    }

    async loadComments() {
        try {
            // Essayer de charger depuis le backend
            this.comments = await this.loadFromBackend();
        } catch (error) {
            // Fallback : charger depuis le local storage
            this.comments = this.getLocalComments();
        }

        this.displayComments();
    }

    async loadFromBackend() {
        const response = await fetch(CONFIG.COMMENTS.apiUrl);
        if (!response.ok) {
            throw new Error('Erreur chargement');
        }
        return await response.json();
    }

    getLocalComments() {
        return JSON.parse(localStorage.getItem('bioLinkComments') || '[]');
    }

    displayComments() {
        const commentsList = document.getElementById('comments-list');
        const commentsCount = document.getElementById('comments-count');
        
        commentsList.innerHTML = '';
        commentsCount.textContent = this.comments.length;

        this.comments.forEach(comment => {
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

    resetForm() {
        document.getElementById('comment-name').value = '';
        document.getElementById('comment-rating').value = '';
        document.getElementById('comment-text').value = '';
    }
}

// Initialisation
let commentManager;

document.addEventListener('DOMContentLoaded', () => {
    commentManager = new CommentManager();
});