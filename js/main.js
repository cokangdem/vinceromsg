// Tout le reste du JavaScript (protection contacts, calculateur distance, etc.)
document.addEventListener('DOMContentLoaded', function() {
    // Protection des contacts
    document.getElementById('show-phone').addEventListener('click', function() {
        this.innerHTML = `<span>📱</span> ${CONFIG.USER.phone}`;
        this.style.backgroundColor = '#28a745';
    });
    
    document.getElementById('show-email').addEventListener('click', function() {
        this.innerHTML = `<span>✉️</span> ${CONFIG.USER.email}`;
        this.style.backgroundColor = '#28a745';
    });

    // Calculateur de distance
    document.getElementById('calculate-distance').addEventListener('click', function() {
        // Votre code calculateur de distance ici
    });

    // Initialisation des statistiques
    document.querySelectorAll('.stat-card')[0].querySelector('.stat-value').textContent = CONFIG.STATS.experience;
    document.querySelectorAll('.stat-card')[1].querySelector('.stat-value').textContent = CONFIG.STATS.rating;
    // etc.
});