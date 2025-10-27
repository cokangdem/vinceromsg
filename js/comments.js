// js/comments.js
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
            const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=addComment`, {
                method: 'POST',
                body: JSON.stringify(commentData)
            });
            
            const result = await response.json();
            alert(result.message);
            
        } catch (error) {
            alert('Erreur lors de l\'envoi du commentaire. Veuillez réessayer.');
            console.error('Erreur:', error);
        }

        this.resetForm();
        await this.loadComments(); // Recharger les commentaires
    }

    async loadComments() {
        try {
            const response = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getComments`);
            this.comments = await response.json();
            this.displayComments();
        } catch (error) {
            console.error('Erreur chargement comments:', error);
            this.comments = [];
        }
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