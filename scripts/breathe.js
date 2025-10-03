const audio = document.getElementById('bg-audio');
const soundSelect = document.getElementById('sound-select');
const playPauseBtn = document.getElementById('play-pause');
const volumeSlider = document.getElementById('volume');

let isPlaying = false;

// Initial audio setup
audio.src = `assets/audio/${soundSelect.value}`;
audio.volume = volumeSlider.value;

// Toggle play/pause
playPauseBtn.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  } else {
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }
  isPlaying = !isPlaying;
});

// Sound change
soundSelect.addEventListener('change', () => {
  audio.src = `assets/audio/${soundSelect.value}`;
  if (isPlaying) audio.play();
});

// Volume control
volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});
