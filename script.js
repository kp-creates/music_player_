const songs = [
    { title: "push the feeling on - slowed", artist: "nightcrawlers", cover: "assets/cover1.jpg", src: "assets/song1.mp3" },
    { title: "Sunflower", artist: "Post Malone,Swae Lee", cover: "assets/cover2.jpg", src: "assets/song2.mp3" },
    { title: "Treat You Better", artist: "Shawn Mendes", cover: "assets/cover3.jpg", src: "assets/song3.mp3" }
];

let songIndex = 0;
let isPlaying = false;

// SVG Icon Paths
const playSVG = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
const pauseSVG = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;

// DOM Elements
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover');
const vinylRecord = document.getElementById('vinyl-record');
const menuBtn = document.getElementById('menu-btn');
const closeDrawer = document.getElementById('close-drawer');
const playlistDrawer = document.getElementById('playlist-drawer');
const songListContainer = document.getElementById('song-list');

// Initialize
loadSong(songs[songIndex]);
initPlaylistUI();

function loadSong(song) {
    title.textContent = song.title;
    artist.textContent = song.artist;
    cover.src = song.cover;
    audio.src = song.src;
    
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";
    progress.style.width = '0%';

    if (cover.complete) {
        extractColorsOffline();
    } else {
        cover.onload = extractColorsOffline;
    }
}

// Native Canvas Color Extractor (Replaces ColorThief offline)
function extractColorsOffline() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(cover, 0, 0, 10, 10);
        
        // Sample two corner pixels for a natural two-tone gradient
        const pixel1 = ctx.getImageData(2, 2, 1, 1).data;
        const pixel2 = ctx.getImageData(7, 7, 1, 1).data;
        
        document.documentElement.style.setProperty('--dominant-color', `rgb(${pixel1[0]}, ${pixel1[1]}, ${pixel1[2]})`);
        document.documentElement.style.setProperty('--accent-color', `rgb(${pixel2[0]}, ${pixel2[1]}, ${pixel2[2]})`);
    } catch (e) {
        // Fallback colors remain active if local browser blocks pixel reading
    }
}

function initPlaylistUI() {
    songListContainer.innerHTML = '';
    songs.forEach((song, idx) => {
        const li = document.createElement('li');
        li.classList.add('song-item');
        if (idx === songIndex) li.classList.add('active');
        
        li.innerHTML = `
            <img src="${song.cover}" alt="cover">
            <div class="song-item-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
        `;
        
        li.addEventListener('click', () => {
            songIndex = idx;
            loadSong(songs[songIndex]);
            updateActivePlaylistItem();
            playSong();
        });
        
        songListContainer.appendChild(li);
    });
}

function updateActivePlaylistItem() {
    document.querySelectorAll('.song-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === songIndex);
    });
}

function togglePlay() {
    isPlaying ? pauseSong() : playSong();
}

function playSong() {
    isPlaying = true;
    playIcon.innerHTML = pauseSVG;
    vinylRecord.classList.add('playing');
    audio.play();
}

function pauseSong() {
    isPlaying = false;
    playIcon.innerHTML = playSVG;
    vinylRecord.classList.remove('playing');
    audio.pause();
}

function prevSong() {
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    loadSong(songs[songIndex]);
    updateActivePlaylistItem();
    if (isPlaying) playSong();
}

function nextSong() {
    songIndex = (songIndex + 1) % songs.length;
    loadSong(songs[songIndex]);
    updateActivePlaylistItem();
    if (isPlaying) playSong();
}

function formatTime(sec) {
    return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (duration) {
        progress.style.width = `${(currentTime / duration) * 100}%`;
        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
    }
}

function setProgress(e) {
    if (audio.duration) {
        audio.currentTime = (e.offsetX / this.clientWidth) * audio.duration;
    }
}

// Event Listeners
menuBtn.addEventListener('click', () => playlistDrawer.classList.add('open'));
closeDrawer.addEventListener('click', () => playlistDrawer.classList.remove('open'));
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
audio.addEventListener('timeupdate', updateProgress);
progressContainer.addEventListener('click', setProgress);
audio.addEventListener('ended', nextSong);
