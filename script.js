// Global Variables
let breathingInterval = null;
let breathingCycle = 0;
let isBreathing = false;
let ambientPlaying = false;

// Assessment Questions
const assessmentQuestions = [
    {
        id: 1,
        question: "Seberapa sering Anda merasa cemas dalam seminggu terakhir?",
        options: ["Tidak Pernah", "Kadang-kadang", "Sering"]
    },
    {
        id: 2,
        question: "Seberapa sering Anda mengalami kesulitan tidur?",
        options: ["Tidak Pernah", "Kadang-kadang", "Sering"]
    },
    {
        id: 3,
        question: "Seberapa sering Anda merasa lelah atau kehilangan energi?",
        options: ["Tidak Pernah", "Kadang-kadang", "Sering"]
    },
    {
        id: 4,
        question: "Seberapa mudah Anda merasa kewalahan dengan tugas sehari-hari?",
        options: ["Tidak Pernah", "Kadang-kadang", "Sering"]
    },
    {
        id: 5,
        question: "Seberapa sering Anda merasa sulit berkonsentrasi?",
        options: ["Tidak Pernah", "Kadang-kadang", "Sering"]
    },
    {
        id: 6,
        question: "Seberapa sering Anda merasa tidak termotivasi?",
        options: ["Tidak Pernah", "Kadang-kadang", "Sering"]
    },
    {
        id: 7,
        question: "Seberapa sering Anda menikmati aktivitas yang biasanya Anda sukai?",
        options: ["Sering", "Kadang-kadang", "Tidak Pernah"]
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initMoodTracker();
    initBreathing();
    initMindfulness();
    initAssessment();
    initJournal();
    loadMoodHistory();
    loadJournalEntries();
});

// Navigation System
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all buttons
            navButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(s => s.classList.remove('active'));
            
            // Show target section
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Feature cards navigation
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const target = this.getAttribute('data-go');
            const targetBtn = document.querySelector(`[data-section="${target}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        });
    });
}

// Mood Tracker
function initMoodTracker() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    
    moodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const mood = this.getAttribute('data-mood');
            saveMood(mood);
        });
    });
}

function saveMood(mood) {
    const now = new Date();
    const moodEntry = {
        mood: mood,
        date: now.toISOString(),
        timestamp: now.getTime()
    };

    // Get existing moods
    let moods = JSON.parse(localStorage.getItem('moods')) || [];
    moods.unshift(moodEntry);
    
    // Keep only last 30 entries
    if (moods.length > 30) {
        moods = moods.slice(0, 30);
    }

    localStorage.setItem('moods', JSON.stringify(moods));
    
    // Show confirmation
    showNotification('Mood berhasil disimpan! 💚');
    
    // Reload mood display
    loadMoodHistory();
}

function loadMoodHistory() {
    const moods = JSON.parse(localStorage.getItem('moods')) || [];
    const moodList = document.getElementById('moodList');
    const moodChart = document.getElementById('moodChart');

    if (moods.length === 0) {
        moodList.innerHTML = '<div class="empty-state">Belum ada data mood. Mulai catat mood Anda hari ini!</div>';
        moodChart.innerHTML = '<div class="empty-state">Grafik akan muncul setelah Anda mencatat mood</div>';
        return;
    }

    // Display mood list
    moodList.innerHTML = '';
    moods.slice(0, 10).forEach(entry => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const timeStr = date.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const emoji = getMoodEmoji(entry.mood);
        
        const entryDiv = document.createElement('div');
        entryDiv.className = 'mood-entry';
        entryDiv.innerHTML = `
            <span class="mood-entry-mood">${emoji}</span>
            <span class="mood-entry-date">${dateStr} - ${timeStr}</span>
        `;
        moodList.appendChild(entryDiv);
    });

    // Display mood chart (last 7 days)
    moodChart.innerHTML = '';
    const last7 = moods.slice(0, 7).reverse();
    
    if (last7.length > 0) {
        last7.forEach(entry => {
            const bar = document.createElement('div');
            bar.className = 'mood-bar';
            const height = getMoodHeight(entry.mood);
            bar.style.height = height + 'px';
            
            const emoji = document.createElement('div');
            emoji.className = 'mood-bar-emoji';
            emoji.textContent = getMoodEmoji(entry.mood);
            bar.appendChild(emoji);
            
            moodChart.appendChild(bar);
        });
    }
}

function getMoodEmoji(mood) {
    const emojis = {
        'senang': '😊',
        'netral': '😐',
        'sedih': '😢',
        'stres': '😰',
        'marah': '😠'
    };
    return emojis[mood] || '😐';
}

function getMoodHeight(mood) {
    const heights = {
        'senang': 120,
        'netral': 80,
        'sedih': 60,
        'stres': 50,
        'marah': 40
    };
    return heights[mood] || 70;
}

// Breathing Exercise
function initBreathing() {
    const startBtn = document.getElementById('startBreathing');
    const stopBtn = document.getElementById('stopBreathing');
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const progress = document.getElementById('breathingProgress');
    const cycleCount = document.getElementById('cycleCount');

    startBtn.addEventListener('click', function() {
        startBreathing();
        startBtn.classList.add('hide');
        stopBtn.classList.remove('hide');
        progress.classList.remove('hide');
    });

    stopBtn.addEventListener('click', function() {
        stopBreathing();
        stopBtn.classList.add('hide');
        startBtn.classList.remove('hide');
        progress.classList.add('hide');
    });
}

function startBreathing() {
    isBreathing = true;
    breathingCycle = 0;
    runBreathingCycle();
}

function stopBreathing() {
    isBreathing = false;
    clearTimeout(breathingInterval);
    
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const cycleCount = document.getElementById('cycleCount');
    
    circle.className = 'breathing-circle';
    text.textContent = 'Mulai';
    cycleCount.textContent = '0';
    breathingCycle = 0;
}

function runBreathingCycle() {
    if (!isBreathing || breathingCycle >= 5) {
        if (breathingCycle >= 5) {
            showNotification('Latihan pernapasan selesai! 🌟');
            stopBreathing();
            document.getElementById('stopBreathing').classList.add('hide');
            document.getElementById('startBreathing').classList.remove('hide');
            document.getElementById('breathingProgress').classList.add('hide');
        }
        return;
    }

    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const cycleCount = document.getElementById('cycleCount');

    // Breathe In - 4 seconds
    circle.className = 'breathing-circle breathe-in';
    text.textContent = 'Tarik Napas';
    
    breathingInterval = setTimeout(() => {
        // Hold - 4 seconds
        circle.className = 'breathing-circle hold';
        text.textContent = 'Tahan';
        
        breathingInterval = setTimeout(() => {
            // Breathe Out - 6 seconds
            circle.className = 'breathing-circle breathe-out';
            text.textContent = 'Buang Napas';
            
            breathingInterval = setTimeout(() => {
                breathingCycle++;
                cycleCount.textContent = breathingCycle;
                
                // Small pause before next cycle
                circle.className = 'breathing-circle';
                text.textContent = 'Bersiap...';
                
                breathingInterval = setTimeout(() => {
                    runBreathingCycle();
                }, 1000);
            }, 6000);
        }, 4000);
    }, 4000);
}

// Mindfulness
function initMindfulness() {
    const playBtn = document.getElementById('playAmbient');
    const pauseBtn = document.getElementById('pauseAmbient');
    const status = document.getElementById('ambientStatus');

    playBtn.addEventListener('click', function() {
        ambientPlaying = true;
        playBtn.classList.add('hide');
        pauseBtn.classList.remove('hide');
        status.textContent = '🎵 Sedang diputar... (Bayangkan suara alam yang menenangkan)';
        status.style.color = '#4A148C';
    });

    pauseBtn.addEventListener('click', function() {
        ambientPlaying = false;
        pauseBtn.classList.add('hide');
        playBtn.classList.remove('hide');
        status.textContent = 'Dijeda';
        status.style.color = '#666';
    });
}

// Self-Assessment
function initAssessment() {
    renderQuestions();
    
    const submitBtn = document.getElementById('submitAssessment');
    const retakeBtn = document.getElementById('retakeAssessment');

    submitBtn.addEventListener('click', calculateAssessment);
    retakeBtn.addEventListener('click', resetAssessment);
}

function renderQuestions() {
    const container = document.getElementById('quizQuestions');
    container.innerHTML = '';

    assessmentQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        let optionsHTML = '';
        q.options.forEach((option, optIndex) => {
            optionsHTML += `
                <div class="answer-option">
                    <input type="radio" id="q${q.id}_${optIndex}" name="question${q.id}" value="${optIndex}">
                    <label for="q${q.id}_${optIndex}">${option}</label>
                </div>
            `;
        });

        questionDiv.innerHTML = `
            <h4>${index + 1}. ${q.question}</h4>
            <div class="answer-options">
                ${optionsHTML}
            </div>
        `;

        container.appendChild(questionDiv);
    });
}

function calculateAssessment() {
    let totalScore = 0;
    let answeredAll = true;

    assessmentQuestions.forEach(q => {
        const selected = document.querySelector(`input[name="question${q.id}"]:checked`);
        if (!selected) {
            answeredAll = false;
        } else {
            // Special handling for question 7 (reversed scoring)
            if (q.id === 7) {
                totalScore += (2 - parseInt(selected.value));
            } else {
                totalScore += parseInt(selected.value);
            }
        }
    });

    if (!answeredAll) {
        showNotification('Harap jawab semua pertanyaan! ⚠️');
        return;
    }

    // Calculate percentage
    const maxScore = assessmentQuestions.length * 2;
    const percentage = (totalScore / maxScore) * 100;

    // Show result
    displayAssessmentResult(percentage);
}

function displayAssessmentResult(percentage) {
    const quizContainer = document.getElementById('assessmentQuiz');
    const resultContainer = document.getElementById('assessmentResult');
    const resultContent = document.getElementById('resultContent');

    let resultHTML = '';
    let resultTitle = '';
    let resultMessage = '';
    let suggestions = '';

    if (percentage <= 30) {
        resultTitle = '✨ Kondisi Anda Terlihat Stabil';
        resultMessage = 'Anda tampak dalam kondisi emosional yang cukup baik. Terus jaga kesehatan mental Anda dengan praktik self-care yang konsisten.';
        suggestions = `
            <ul>
                <li>Pertahankan rutinitas sehat Anda</li>
                <li>Terus praktikkan mindfulness dan relaksasi</li>
                <li>Jaga pola tidur yang teratur</li>
                <li>Luangkan waktu untuk hobi dan aktivitas yang Anda nikmati</li>
            </ul>
        `;
    } else if (percentage <= 60) {
        resultTitle = '💭 Anda Mungkin Sedang Mengalami Stres';
        resultMessage = 'Anda menunjukkan beberapa tanda stres. Ini hal yang wajar, namun penting untuk meluangkan waktu merawat diri sendiri.';
        suggestions = `
            <ul>
                <li>Cobalah latihan pernapasan dan relaksasi secara rutin</li>
                <li>Kurangi beban kerja jika memungkinkan</li>
                <li>Bicarakan perasaan Anda dengan orang terdekat</li>
                <li>Lakukan aktivitas fisik ringan seperti jalan kaki</li>
                <li>Pastikan Anda cukup tidur dan istirahat</li>
            </ul>
        `;
    } else {
        resultTitle = '🌙 Anda Mungkin Perlu Lebih Banyak Istirahat';
        resultMessage = 'Anda tampak sedang mengalami tingkat stres yang cukup tinggi. Prioritaskan kesehatan mental Anda dan pertimbangkan untuk mencari dukungan.';
        suggestions = `
            <ul>
                <li>Ambil waktu istirahat yang cukup</li>
                <li>Praktikkan teknik relaksasi setiap hari</li>
                <li>Kurangi aktivitas yang membebani</li>
                <li>Bicarakan dengan orang yang Anda percaya</li>
                <li>Pertimbangkan untuk berkonsultasi dengan profesional kesehatan mental</li>
                <li>Jaga pola makan dan tidur yang sehat</li>
            </ul>
        `;
    }

    resultHTML = `
        <div class="result-box">
            <h4>${resultTitle}</h4>
            <p>${resultMessage}</p>
            <h4 style="margin-top: 20px;">Saran untuk Anda:</h4>
            ${suggestions}
        </div>
        <p style="color: #F57F17; margin-top: 20px; font-size: 0.95rem;">
            <strong>Catatan:</strong> Ini bukan diagnosis medis. Jika Anda merasa membutuhkan bantuan profesional, jangan ragu untuk menghubungi psikolog atau konselor.
        </p>
    `;

    resultContent.innerHTML = resultHTML;
    quizContainer.classList.add('hide');
    resultContainer.classList.remove('hide');
}

function resetAssessment() {
    const quizContainer = document.getElementById('assessmentQuiz');
    const resultContainer = document.getElementById('assessmentResult');

    // Reset all radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });

    resultContainer.classList.add('hide');
    quizContainer.classList.remove('hide');
}

// Journal
function initJournal() {
    const saveBtn = document.getElementById('saveJournal');
    const textArea = document.getElementById('journalText');

    saveBtn.addEventListener('click', function() {
        const content = textArea.value.trim();
        
        if (content === '') {
            showNotification('Harap tulis sesuatu terlebih dahulu! ✏️');
            return;
        }

        saveJournalEntry(content);
        textArea.value = '';
    });
}

function saveJournalEntry(content) {
    const now = new Date();
    const entry = {
        id: now.getTime(),
        content: content,
        date: now.toISOString()
    };

    let journals = JSON.parse(localStorage.getItem('journals')) || [];
    journals.unshift(entry);

    // Keep only last 50 entries
    if (journals.length > 50) {
        journals = journals.slice(0, 50);
    }

    localStorage.setItem('journals', JSON.stringify(journals));
    
    showNotification('Catatan berhasil disimpan! 📖');
    loadJournalEntries();
}

function loadJournalEntries() {
    const journals = JSON.parse(localStorage.getItem('journals')) || [];
    const journalList = document.getElementById('journalList');

    if (journals.length === 0) {
        journalList.innerHTML = '<div class="empty-state">Belum ada catatan. Mulai menulis jurnal Anda hari ini!</div>';
        return;
    }

    journalList.innerHTML = '';
    
    journals.forEach(entry => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-item';
        entryDiv.innerHTML = `
            <div class="journal-date">${dateStr}</div>
            <div class="journal-content">${entry.content}</div>
            <button class="journal-delete" data-id="${entry.id}">Hapus</button>
        `;

        journalList.appendChild(entryDiv);
    });

    // Add delete functionality
    document.querySelectorAll('.journal-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteJournalEntry(id);
        });
    });
}

function deleteJournalEntry(id) {
    let journals = JSON.parse(localStorage.getItem('journals')) || [];
    journals = journals.filter(entry => entry.id !== id);
    localStorage.setItem('journals', JSON.stringify(journals));
    
    showNotification('Catatan berhasil dihapus! 🗑️');
    loadJournalEntries();
}

// Utility Functions
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}