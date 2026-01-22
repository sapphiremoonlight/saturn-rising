const audio = document.getElementById('bg-audio');
const soundSelect = document.getElementById('sound-select');
const playPauseBtn = document.getElementById('play-pause');
const volumeSlider = document.getElementById('volume');

let isPlaying = false;

// Initial audio setup
audio.src = `assets/audios/${soundSelect.value}`;
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
  audio.src = `assets/audios/${soundSelect.value}`;
  if (isPlaying) audio.play();
});

// Volume control
volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

// 🌊 Function to add ripple effect on click 🌊 
document.querySelector('.bubble-container').addEventListener('click', function(e) {
  const ripple = document.createElement('div');
  const size = Math.max(this.offsetWidth, this.offsetHeight);
  const x = e.clientX - this.offsetLeft - size / 2;
  const y = e.clientY - this.offsetTop - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  ripple.classList.add('ripple');
  this.appendChild(ripple);

  // Remove the ripple effect after the animation
  setTimeout(() => {
    ripple.remove();
  }, 1200);
});

// BUBBLE THEMES
const themes = ['theme-default', 'theme-heart', 'theme-star', 'theme-sunset'];

// Function to change theme
function changeTheme(theme) {
  // Remove all themes
  themes.forEach(t => document.body.classList.remove(t));

  // Add selected theme
  document.body.classList.add(theme);
}

// Example usage: set to heart theme on page load
window.onload = function() {
  changeTheme('theme-heart');
};

// Assuming you have a dropdown or buttons to change themes
document.querySelector('#theme-select').addEventListener('change', function(e) {
  changeTheme(e.target.value);
});


