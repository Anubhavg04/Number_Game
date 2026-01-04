// Game State Management
class MotivationGame {
    constructor() {
        this.magicNumber = 0;
        this.attempts = 0;
        this.maxAttempts = 3;
        this.gameActive = false;
        
        // Initialize game statistics from localStorage
        this.stats = this.loadStats();
        
        // Global tracking settings
        this.countApiNamespace = 'life-motivation-game';
        this.countApiKey = 'visits';
        
        // Initialize global player count
        this.initializeGlobalTracking();
        
        // Motivational content
        this.winMessages = [
            "Congratulations! You're a winner today! 🎉",
            "Amazing! Your intuition is spot on! ✨",
            "Brilliant! You've got the magic touch! 🌟",
            "Fantastic! Your positive energy paid off! 💫",
            "Wonderful! You're on a winning streak! 🎯"
        ];
        
        this.loseMessages = [
            "Failure is feedback, not defeat 🌱",
            "Every loss is preparing you for a bigger win 🚀",
            "You didn't lose, you learned 📚",
            "This setback is setting up your comeback 💪",
            "Every expert was once a beginner 🌟"
        ];
        
        this.motivationalQuotes = [
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
            { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
            { text: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.", author: "Roy T. Bennett" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Your limitation—it's only your imagination.", author: "Unknown" },
            { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
            { text: "Great things never come from comfort zones.", author: "Unknown" },
            { text: "Dream it. Wish it. Do it.", author: "Unknown" },
            { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
            { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" }
        ];
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateStatsDisplay();
    }
    
    // DOM Element References
    initializeElements() {
        this.elements = {
            // Screens
            startScreen: document.getElementById('startScreen'),
            gameScreen: document.getElementById('gameScreen'),
            resultScreen: document.getElementById('resultScreen'),
            
            // Buttons
            startBtn: document.getElementById('startBtn'),
            submitGuessBtn: document.getElementById('submitGuessBtn'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            shareBtn: document.getElementById('shareBtn'),
            
            // Game elements
            guessInput: document.getElementById('guessInput'),
            hintContainer: document.getElementById('hintContainer'),
            
            // Result elements
            resultIcon: document.getElementById('resultIcon'),
            resultTitle: document.getElementById('resultTitle'),
            resultMessage: document.getElementById('resultMessage'),
            quoteText: document.getElementById('quoteText'),
            quoteAuthor: document.getElementById('quoteAuthor'),
            
            // Stats
            totalGames: document.getElementById('totalGames'),
            winCount: document.getElementById('winCount'),
            lossCount: document.getElementById('lossCount'),
            globalPlayers: document.getElementById('globalPlayers')
        };
    }
    
    // Event Listeners
    attachEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.submitGuessBtn.addEventListener('click', () => this.submitGuess());
        this.elements.playAgainBtn.addEventListener('click', () => this.resetToStart());
        this.elements.shareBtn.addEventListener('click', () => this.shareResult());
        
        // Enter key support for input
        this.elements.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitGuess();
            }
        });
        
        // Input validation
        this.elements.guessInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < 1 || value > 10) {
                e.target.setCustomValidity('Please enter a number between 1 and 10');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }
    
    // Game Logic Methods
    startGame() {
        this.magicNumber = Math.floor(Math.random() * 10) + 1;
        this.attempts = 0;
        this.gameActive = true;
        
        // Clear previous game state
        this.elements.guessInput.value = '';
        this.elements.hintContainer.textContent = '';
        this.elements.guessInput.disabled = false;
        this.elements.submitGuessBtn.disabled = false;
        
        // Switch screens
        this.showScreen('gameScreen');
        
        // Focus on input for better UX
        setTimeout(() => {
            this.elements.guessInput.focus();
        }, 100);
    }
    
    submitGuess() {
        if (!this.gameActive) return;
        
        const guess = parseInt(this.elements.guessInput.value);
        
        // Validate input
        if (!guess || guess < 1 || guess > 10) {
            this.showHint('⚠️ Please enter a number between 1 and 10');
            return;
        }
        
        this.attempts++;
        
        // Check guess
        if (guess === this.magicNumber) {
            this.endGame(true);
        } else if (this.attempts >= this.maxAttempts) {
            this.endGame(false);
        } else {
            // Provide hint
            const hint = guess < this.magicNumber ? '📈 Try a higher number!' : '📉 Try a lower number!';
            this.showHint(`${hint} (${this.maxAttempts - this.attempts} attempts left)`);
            
            // Clear input for next attempt
            this.elements.guessInput.value = '';
            this.elements.guessInput.focus();
        }
    }
    
    endGame(won) {
        this.gameActive = false;
        this.elements.guessInput.disabled = true;
        this.elements.submitGuessBtn.disabled = true;
        
        // Update statistics
        this.stats.totalGames++;
        if (won) {
            this.stats.wins++;
        } else {
            this.stats.losses++;
        }
        this.saveStats();
        this.updateStatsDisplay();
        
        // Track game play globally
        this.trackGamePlay(won);
        
        // Show result screen
        this.showResult(won);
    }
    
    showResult(won) {
        // Set result content
        if (won) {
            const winMessage = this.getRandomElement(this.winMessages);
            this.elements.resultIcon.textContent = '🎉';
            this.elements.resultTitle.textContent = 'Congratulations!';
            this.elements.resultMessage.textContent = `${winMessage}\n\nYou guessed the magic number ${this.magicNumber} in ${this.attempts} attempt${this.attempts > 1 ? 's' : ''}!`;
        } else {
            const loseMessage = this.getRandomElement(this.loseMessages);
            this.elements.resultIcon.textContent = '🌱';
            this.elements.resultTitle.textContent = 'Keep Growing!';
            this.elements.resultMessage.textContent = `${loseMessage}\n\nThe magic number was ${this.magicNumber}. Better luck next time!`;
        }
        
        // Add motivational quote
        const quote = this.getRandomElement(this.motivationalQuotes);
        this.elements.quoteText.textContent = `"${quote.text}"`;
        this.elements.quoteAuthor.textContent = `— ${quote.author}`;
        
        // Switch to result screen
        this.showScreen('resultScreen');
    }
    
    resetToStart() {
        this.showScreen('startScreen');
    }
    
    // UI Helper Methods
    showScreen(screenId) {
        // Hide all screens
        Object.values(this.elements).forEach(element => {
            if (element && element.classList && element.classList.contains('screen')) {
                element.classList.add('hidden');
            }
        });
        
        // Show target screen
        this.elements[screenId].classList.remove('hidden');
    }
    
    showHint(message) {
        this.elements.hintContainer.textContent = message;
        // Add animation for better UX
        this.elements.hintContainer.style.animation = 'none';
        setTimeout(() => {
            this.elements.hintContainer.style.animation = 'fadeIn 0.3s ease-out';
        }, 10);
    }
    
    // Statistics Management
    loadStats() {
        const defaultStats = {
            totalGames: 0,
            wins: 0,
            losses: 0
        };
        
        try {
            const saved = localStorage.getItem('motivationGameStats');
            return saved ? JSON.parse(saved) : defaultStats;
        } catch (error) {
            console.warn('Could not load stats from localStorage:', error);
            return defaultStats;
        }
    }
    
    saveStats() {
        try {
            localStorage.setItem('motivationGameStats', JSON.stringify(this.stats));
        } catch (error) {
            console.warn('Could not save stats to localStorage:', error);
        }
    }
    
    updateStatsDisplay() {
        this.elements.totalGames.textContent = this.stats.totalGames;
        this.elements.winCount.textContent = this.stats.wins;
        this.elements.lossCount.textContent = this.stats.losses;
    }
    
    // Global Player Tracking Methods
    async initializeGlobalTracking() {
        // Load global player count on page load
        await this.updateGlobalPlayerCount();
        
        // Track new visitor
        await this.incrementGlobalPlayerCount();
    }
    
    async updateGlobalPlayerCount() {
        try {
            const response = await fetch(`https://api.countapi.xyz/get/${this.countApiNamespace}/${this.countApiKey}`);
            const data = await response.json();
            
            if (data.value !== undefined) {
                this.elements.globalPlayers.textContent = data.value.toLocaleString();
            } else {
                this.elements.globalPlayers.textContent = '...';
            }
        } catch (error) {
            console.log('Could not fetch global player count:', error);
            this.elements.globalPlayers.textContent = '...';
        }
    }
    
    async incrementGlobalPlayerCount() {
        try {
            const response = await fetch(`https://api.countapi.xyz/hit/${this.countApiNamespace}/${this.countApiKey}`);
            const data = await response.json();
            
            if (data.value !== undefined) {
                this.elements.globalPlayers.textContent = data.value.toLocaleString();
            }
        } catch (error) {
            console.log('Could not increment global player count:', error);
        }
    }
    
    async trackGamePlay(won) {
        // Track game completion in Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'game_completed', {
                'event_category': 'gameplay',
                'event_label': won ? 'win' : 'loss',
                'value': this.attempts
            });
        }
        
        // Update global count after game completion
        await this.updateGlobalPlayerCount();
    }
    
    // Utility Methods
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Share functionality
    shareResult() {
        const shareText = `I played the Life Motivation Game and got an amazing insight! 💙\n\n"${this.elements.quoteText.textContent}"\n\nPlay. Reflect. Grow. 🌱`;
        
        // Try to use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: 'Life Motivation Game',
                text: shareText
            }).catch(error => {
                // Fallback to clipboard if share fails
                this.copyToClipboard(shareText);
            });
        } else {
            // Fallback to clipboard
            this.copyToClipboard(shareText);
        }
    }
    
    copyToClipboard(text) {
        // Create temporary textarea for copying
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        
        try {
            textarea.select();
            document.execCommand('copy');
            this.showNotification('Text copied to clipboard! 📋');
        } catch (error) {
            console.error('Failed to copy text:', error);
            this.showNotification('Could not copy text. Please copy manually.', 'error');
        } finally {
            document.body.removeChild(textarea);
        }
    }
    
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add notification animations to CSS
const notificationStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global game instance
    window.motivationGame = new MotivationGame();
    
    // Add some console love
    console.log('%c🌟 Life Motivation Game Loaded!', 'color: #6366f1; font-size: 16px; font-weight: bold;');
    console.log('%cPlay. Reflect. Grow. 🌱', 'color: #10b981; font-size: 14px;');
});

// Handle page visibility changes to pause/resume if needed
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - could pause animations or sounds if added later
        console.log('Game paused - page hidden');
    } else {
        // Page is visible again
        console.log('Game resumed - page visible');
    }
});

// Error handling for better user experience
window.addEventListener('error', (event) => {
    console.error('Game error:', event.error);
    // Could show user-friendly error message here
});

// Prevent accidental page refresh during game
window.addEventListener('beforeunload', (event) => {
    if (window.motivationGame && window.motivationGame.gameActive) {
        event.preventDefault();
        event.returnValue = 'You have an active game. Are you sure you want to leave?';
    }
});
