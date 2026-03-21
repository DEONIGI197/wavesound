// База данных треков
const tracksDatabase = [
    { id: 1, name: "Starlit Reverie", artist: "Budiarti x Lil magrib", genre: "electronic", duration: "3:24", cover: "🎵" },
    { id: 2, name: "Midnight Confessions", artist: "Alexiao", genre: "pop", duration: "4:12", cover: "🌙" },
    { id: 3, name: "Lost in the Echo", artist: "Budiarti", genre: "electronic", duration: "3:45", cover: "🎧" },
    { id: 4, name: "Whispers in the Breeze", artist: "Alexiao", genre: "indie", duration: "3:58", cover: "🌊" },
    { id: 5, name: "Tears on the Vinyl", artist: "Alexiao", genre: "sad", duration: "4:32", cover: "💿" },
    { id: 6, name: "Breaking the Silence", artist: "Budiarti", genre: "rock", duration: "3:18", cover: "🎸" },
    { id: 7, name: "Like You Do", artist: "Joji", genre: "pop", duration: "4:00", cover: "💜" },
    { id: 8, name: "SLOW DANCING IN THE DARK", artist: "Joji", genre: "pop", duration: "3:29", cover: "🕺" },
    { id: 9, name: "Glimpse of Us", artist: "Joji", genre: "sad", duration: "3:53", cover: "😢" },
    { id: 10, name: "Naa Ready", artist: "Anirudh Ravichander", genre: "hip-hop", duration: "4:22", cover: "🔥" },
    { id: 11, name: "Kaavalaa", artist: "Karikuzham", genre: "pop", duration: "3:45", cover: "🎶" },
    { id: 12, name: "Vaa Vaathi", artist: "Dhanush", genre: "indie", duration: "4:15", cover: "🎤" }
];

// Жанры
const genres = [
    { name: "Party", icon: "🎉", color: "#ff6b6b" },
    { name: "Blues", icon: "🎸", color: "#4d96ff" },
    { name: "Sad", icon: "😢", color: "#a06eff" },
    { name: "Hip-Hop", icon: "🎤", color: "#ff4d4d" },
    { name: "Electronic", icon: "⚡", color: "#00ff88" },
    { name: "Rock", icon: "🤘", color: "#ff884d" },
    { name: "Pop", icon: "🎵", color: "#ff6b9d" },
    { name: "Indie", icon: "🎸", color: "#4dffb5" }
];

// Исполнители
const artists = [
    "Doja Cat", "Billie Eilish", "BTS", "The Weeknd", 
    "Travis Scott", "ASAP Rocky", "Joji", "Budiarti", 
    "Alexiao", "Anirudh", "Dhanush"
];

// Хранилище данных пользователя
let userData = {
    name: "",
    genres: [],
    artists: [],
    likedTracks: [],
    playlists: [],
    listeningTime: 0
};

// Текущий плеер
let currentTrack = null;
let isPlaying = false;
let audioElement = null;
let progressInterval = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные из localStorage
    loadUserData();
    
    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.ready();
        
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            userData.name = user.first_name || user.username || "Музыкоман";
            document.getElementById('profile-name').textContent = userData.name;
            document.getElementById('user-greeting').textContent = `Привет, ${userData.name}!`;
        }
    }
    
    // Запускаем анимацию загрузки
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        initWaveAnimation();
        renderAll();
    }, 1500);
});

// Загрузка данных пользователя
function loadUserData() {
    const saved = localStorage.getItem('wavesound_user');
    if (saved) {
        userData = JSON.parse(saved);
    }
}

// Сохранение данных
function saveUserData() {
    localStorage.setItem('wavesound_user', JSON.stringify(userData));
}

// Рендер всех компонентов
function renderAll() {
    renderTopCharts();
    renderGenreRecommendations();
    renderGlobalCharts();
    renderNewReleases();
    renderLikedSongs();
    renderUserPlaylists();
    renderUserPreferences();
    updateStats();
}

// Рендер топ чарта
function renderTopCharts() {
    const container = document.getElementById('top-charts');
    if (!container) return;
    
    const topTracks = [...tracksDatabase].slice(0, 5);
    container.innerHTML = topTracks.map((track, index) => `
        <div class="track-item" data-track-id="${track.id}">
            <div class="track-number">${index + 1}</div>
            <div class="track-cover-small">${track.cover}</div>
            <div class="track-info">
                <h4>${track.name}</h4>
                <p>${track.artist}</p>
            </div>
            <div class="track-actions">
                <button class="like-track-btn ${userData.likedTracks.includes(track.id) ? 'liked' : ''}" data-id="${track.id}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${userData.likedTracks.includes(track.id) ? '#00ff88' : 'none'}">
                        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3 9.24 3 10.91 3.81 12 5.09 13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button class="play-track-btn" data-id="${track.id}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5V19L19 12L8 5Z"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    attachTrackEvents();
}

// Рендер рекомендаций по жанрам
function renderGenreRecommendations() {
    const container = document.getElementById('genre-recommendations');
    if (!container) return;
    
    const randomGenres = [...genres].sort(() => 0.5 - Math.random()).slice(0, 6);
    container.innerHTML = randomGenres.map(genre => `
        <div class="genre-card" data-genre="${genre.name}">
            <div class="genre-icon">${genre.icon}</div>
            <div class="genre-name">${genre.name}</div>
        </div>
    `).join('');
}

// Рендер глобальных чартов
function renderGlobalCharts() {
    const container = document.getElementById('global-charts');
    if (!container) return;
    
    const chartTracks = [...tracksDatabase].sort(() => 0.5 - Math.random()).slice(0, 8);
    container.innerHTML = chartTracks.map((track, index) => `
        <div class="chart-item" data-track-id="${track.id}">
            <div class="chart-rank">${index + 1}</div>
            <div class="track-info">
                <h4>${track.name}</h4>
                <p>${track.artist}</p>
            </div>
            <button class="play-track-btn" data-id="${track.id}" style="margin-left: auto;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5V19L19 12L8 5Z"/>
                </svg>
            </button>
        </div>
    `).join('');
    
    attachTrackEvents();
}

// Рендер новых релизов
function renderNewReleases() {
    const container = document.getElementById('new-releases');
    if (!container) return;
    
    const releases = [...tracksDatabase].slice(-6).reverse();
    container.innerHTML = releases.map(track => `
        <div class="release-card" data-track-id="${track.id}">
            <div class="release-cover">${track.cover}</div>
            <div class="release-title">${track.name}</div>
            <div class="release-artist">${track.artist}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.release-card').forEach(card => {
        card.addEventListener('click', () => {
            const trackId = parseInt(card.dataset.trackId);
            playTrack(trackId);
        });
    });
}

// Рендер лайкнутых треков
function renderLikedSongs() {
    const container = document.getElementById('liked-songs-list');
    if (!container) return;
    
    const likedTracks = tracksDatabase.filter(t => userData.likedTracks.includes(t.id));
    document.getElementById('liked-count').textContent = likedTracks.length;
    
    if (likedTracks.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Нет лайкнутых треков</p>';
        return;
    }
    
    container.innerHTML = likedTracks.map(track => `
        <div class="track-item" data-track-id="${track.id}">
            <div class="track-cover-small">${track.cover}</div>
            <div class="track-info">
                <h4>${track.name}</h4>
                <p>${track.artist}</p>
            </div>
            <div class="track-actions">
                <button class="unlike-track-btn" data-id="${track.id}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#00ff88">
                        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3 9.24 3 10.91 3.81 12 5.09 13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z"/>
                    </svg>
                </button>
                <button class="play-track-btn" data-id="${track.id}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5V19L19 12L8 5Z"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    attachTrackEvents();
}

// Рендер плейлистов пользователя
function renderUserPlaylists() {
    const container = document.getElementById('user-playlists');
    if (!container) return;
    
    if (userData.playlists.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Нет созданных альбомов</p>';
        return;
    }
    
    container.innerHTML = userData.playlists.map(playlist => `
        <div class="playlist-card" data-playlist="${playlist.name}">
            <div class="playlist-cover">📀</div>
            <div class="playlist-name">${playlist.name}</div>
            <div class="playlist-count">${playlist.tracks?.length || 0} треков</div>
        </div>
    `).join('');
}

// Рендер предпочтений пользователя
function renderUserPreferences() {
    const genresContainer = document.getElementById('user-genres');
    const artistsContainer = document.getElementById('user-artists');
    
    if (genresContainer) {
        if (userData.genres.length === 0) {
            genresContainer.innerHTML = '<span class="tag">Не выбраны</span>';
        } else {
            genresContainer.innerHTML = userData.genres.map(g => `<span class="tag">${g}</span>`).join('');
        }
    }
    
    if (artistsContainer) {
        if (userData.artists.length === 0) {
            artistsContainer.innerHTML = '<span class="tag">Не выбраны</span>';
        } else {
            artistsContainer.innerHTML = userData.artists.map(a => `<span class="tag">${a}</span>`).join('');
        }
    }
}

// Обновление статистики
function updateStats() {
    document.getElementById('total-likes').textContent = userData.likedTracks.length;
    document.getElementById('total-playlists').textContent = userData.playlists.length;
    document.getElementById('listening-time').textContent = Math.floor(userData.listeningTime / 60);
}

// Воспроизведение трека
function playTrack(trackId) {
    const track = tracksDatabase.find(t => t.id === trackId);
    if (!track) return;
    
    currentTrack = track;
    
    if (audioElement) {
        audioElement.pause();
    }
    
    // Создаем имитацию аудио (для демо используем визуализацию)
    audioElement = new Audio();
    audioElement.src = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${trackId}.mp3`;
    
    audioElement.addEventListener('canplay', () => {
        audioElement.play();
        isPlaying = true;
        updatePlayerUI();
        startProgressTracking();
    });
    
    audioElement.addEventListener('ended', () => {
        playNextTrack();
    });
    
    // Обновляем UI плеера
    document.getElementById('player-track-name').textContent = track.name;
    document.getElementById('player-track-artist').textContent = track.artist;
    document.getElementById('mini-player').classList.remove('hidden');
    
    updatePlayerUI();
}

// Обновление UI плеера
function updatePlayerUI() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
        if (isPlaying) {
            playPauseBtn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
            </svg>`;
        } else {
            playPauseBtn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5V19L19 12L8 5Z"/>
            </svg>`;
        }
    }
}

// Пауза/воспроизведение
function togglePlayPause() {
    if (!audioElement) return;
    
    if (isPlaying) {
        audioElement.pause();
        isPlaying = false;
        stopProgressTracking();
    } else {
        audioElement.play();
        isPlaying = true;
        startProgressTracking();
    }
    updatePlayerUI();
}

// Следующий трек
function playNextTrack() {
    if (!currentTrack) return;
    
    const currentIndex = tracksDatabase.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracksDatabase.length;
    playTrack(tracksDatabase[nextIndex].id);
}

// Отслеживание прогресса
function startProgressTracking() {
    if (progressInterval) clearInterval(progressInterval);
    
    progressInterval = setInterval(() => {
        if (audioElement && audioElement.duration) {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            document.getElementById('progress-bar-fill').style.width = `${progress}%`;
        }
    }, 100);
}

function stopProgressTracking() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

// Лайк трека
function likeTrack(trackId) {
    if (!userData.likedTracks.includes(trackId)) {
        userData.likedTracks.push(trackId);
        saveUserData();
        renderAll();
    }
}

// Удалить лайк
function unlikeTrack(trackId) {
    userData.likedTracks = userData.likedTracks.filter(id => id !== trackId);
    saveUserData();
    renderAll();
}

// Прикрепление событий к трекам
function attachTrackEvents() {
    document.querySelectorAll('.like-track-btn').forEach(btn => {
        btn.removeEventListener('click', handleLike);
        btn.addEventListener('click', handleLike);
    });
    
    document.querySelectorAll('.unlike-track-btn').forEach(btn => {
        btn.removeEventListener('click', handleUnlike);
        btn.addEventListener('click', handleUnlike);
    });
    
    document.querySelectorAll('.play-track-btn').forEach(btn => {
        btn.removeEventListener('click', handlePlay);
        btn.addEventListener('click', handlePlay);
    });
}

function handleLike(e) {
    e.stopPropagation();
    const id = parseInt(e.currentTarget.dataset.id);
    likeTrack(id);
}

function handleUnlike(e) {
    e.stopPropagation();
    const id = parseInt(e.currentTarget.dataset.id);
    unlikeTrack(id);
}

function handlePlay(e) {
    e.stopPropagation();
    const id = parseInt(e.currentTarget.dataset.id);
    playTrack(id);
}

// Инициализация волновой анимации
function initWaveAnimation() {
    const canvas = document.getElementById('wave-canvas');
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    let time = 0;
    
    function drawWave() {
        if (!canvas || !ctx) return;
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const bars = 40;
        const barWidth = width / bars;
        
        for (let i = 0; i < bars; i++) {
            const x = i * barWidth;
            const amplitude = Math.sin(time + i * 0.2) * 15 + Math.cos(time * 1.5 + i * 0.3) * 10;
            const barHeight = Math.max(5, 30 + amplitude);
            
            const gradient = ctx.createLinearGradient(x, height - barHeight, x, height);
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#00cc6a');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
        }
        
        time += 0.05;
        requestAnimationFrame(drawWave);
    }
    
    drawWave();
}

// Навигация
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}-page`).classList.add('active');
    });
});

// Кнопка рандомного трека
document.getElementById('randomize-music')?.addEventListener('click', () => {
    const randomTrack = tracksDatabase[Math.floor(Math.random() * tracksDatabase.length)];
    document.getElementById('ai-track-name').textContent = randomTrack.name;
    document.getElementById('ai-track-artist').textContent = randomTrack.artist;
    
    // Анимация волны
    const waveGlow = document.querySelector('.wave-glow');
    if (waveGlow) {
        waveGlow.style.animation = 'glow 0.5s ease';
        setTimeout(() => {
            waveGlow.style.animation = '';
        }, 500);
    }
    
    playTrack(randomTrack.id);
});

// Создание плейлиста
document.getElementById('create-playlist')?.addEventListener('click', () => {
    const name = prompt('Введите название альбома:');
    if (name && name.trim()) {
        userData.playlists.push({
            name: name.trim(),
            tracks: [],
            createdAt: new Date().toISOString()
        });
        saveUserData();
        renderUserPlaylists();
    }
});

// Кнопка настроек вкусов
document.getElementById('edit-preferences')?.addEventListener('click', () => {
    showPreferencesModal();
});

function showPreferencesModal() {
    const modal = document.getElementById('preferences-modal');
    const genreContainer = document.getElementById('genre-options');
    const artistContainer = document.getElementById('artist-options');
    
    if (genreContainer) {
        genreContainer.innerHTML = genres.map(genre => `
            <div class="genre-option ${userData.genres.includes(genre.name) ? 'selected' : ''}" data-genre="${genre.name}">
                ${genre.icon} ${genre.name}
            </div>
        `).join('');
    }
    
    if (artistContainer) {
        artistContainer.innerHTML = artists.map(artist => `
            <div class="artist-option ${userData.artists.includes(artist) ? 'selected' : ''}" data-artist="${artist}">
                ${artist}
            </div>
        `).join('');
    }
    
    // События выбора
    document.querySelectorAll('.genre-option').forEach(opt => {
        opt.addEventListener('click', () => {
            opt.classList.toggle('selected');
        });
    });
    
    document.querySelectorAll('.artist-option').forEach(opt => {
        opt.addEventListener('click', () => {
            opt.classList.toggle('selected');
        });
    });
    
    modal.classList.remove('hidden');
}

// Сохранение настроек
document.getElementById('save-preferences')?.addEventListener('click', () => {
    const selectedGenres = Array.from(document.querySelectorAll('.genre-option.selected'))
        .map(opt => opt.dataset.genre);
    const selectedArtists = Array.from(document.querySelectorAll('.artist-option.selected'))
        .map(opt => opt.dataset.artist);
    
    userData.genres = selectedGenres;
    userData.artists = selectedArtists;
    saveUserData();
    renderUserPreferences();
    
    document.getElementById('preferences-modal').classList.add('hidden');
    
    // Показываем уведомление
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showPopup({
            title: 'Готово!',
            message: 'Твои музыкальные предпочтения сохранены. AI будет подбирать музыку по твоему вкусу!',
            buttons: [{ type: 'ok' }]
        });
    }
});

// Закрытие модалки по клику вне
document.getElementById('preferences-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('preferences-modal')) {
        e.target.classList.add('hidden');
    }
});

// Кнопки плеера
document.getElementById('play-pause-btn')?.addEventListener('click', togglePlayPause);
document.getElementById('next-btn')?.addEventListener('click', playNextTrack);

// Кнопка "Смотреть все" на чарты
document.querySelectorAll('.see-all').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.goto === 'discover') {
            document.querySelector('[data-page="discover"]').click();
        }
    });
});

// Поиск
document.getElementById('search-input')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = tracksDatabase.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.artist.toLowerCase().includes(query)
    );
    
    // Обновляем чарты с результатами поиска
    const container = document.getElementById('global-charts');
    if (container && query) {
        container.innerHTML = filtered.map((track, index) => `
            <div class="chart-item" data-track-id="${track.id}">
                <div class="chart-rank">${index + 1}</div>
                <div class="track-info">
                    <h4>${track.name}</h4>
                    <p>${track.artist}</p>
                </div>
                <button class="play-track-btn" data-id="${track.id}" style="margin-left: auto;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5V19L19 12L8 5Z"/>
                    </svg>
                </button>
            </div>
        `).join('');
        attachTrackEvents();
    } else if (container && !query) {
        renderGlobalCharts();
    }
});