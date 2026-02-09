/*************************************************
 * 🎧 AUDIO CONTROLS + ASMR SUB-OPTIONS
 *************************************************/

const audio = document.getElementById('bg-audio');
const soundSelect = document.getElementById('sound-select');
const asmrSubSelect = document.getElementById('asmr-sub-select');
const playPauseBtn = document.getElementById('play-pause');
const volumeSlider = document.getElementById('volume');
const asmrLabel = document.getElementById('asmr-label');


let isPlaying = false;

// Initial audio setup
audio.volume = volumeSlider.value;
updateAudioSource();

// ▶️ Play / Pause
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

// 🔊 Volume control
volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

// 🎵 ASMR sub-option change
asmrSubSelect.addEventListener('change', updateAudioSource);

// 🔁 Single source of truth for audio
function updateAudioSource() {
  let src;

  if (soundSelect.value === 'asmr') {
    src = `assets/audios/${asmrSubSelect.value}`;
  } else {
    src = `assets/audios/${soundSelect.value}`;
  }

  audio.src = src;
  if (isPlaying) audio.play();
}

soundSelect.addEventListener('change', () => {
  const isASMR = soundSelect.value === 'asmr';

  asmrSubSelect.style.display = isASMR ? 'block' : 'none';
  asmrLabel.style.display = isASMR ? 'block' : 'none';

  updateAudioSource();
});

/*************************************************
 * 🌊 RIPPLE EFFECT (BUBBLE)
 *************************************************/

document.querySelector('.bubble-container').addEventListener('click', function (e) {
  const ripple = document.createElement('div');
  const size = Math.max(this.offsetWidth, this.offsetHeight);
  const x = e.clientX - this.offsetLeft - size / 2;
  const y = e.clientY - this.offsetTop - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  ripple.classList.add('ripple');
  this.appendChild(ripple);

  setTimeout(() => ripple.remove(), 1200);
});

/*************************************************
 * 🎨 BUBBLE THEMES
 *************************************************/

const themes = [
  'theme-default',
  'theme-diamond',
  'theme-star',
  'theme-sunset'
];

function changeTheme(theme) {
  themes.forEach(t => document.body.classList.remove(t));
  document.body.classList.add(theme);
}

// Default theme on load
window.addEventListener('load', () => {
  changeTheme('theme-default');
});

// Theme selector
document.getElementById('theme-select').addEventListener('change', (e) => {
  changeTheme(e.target.value);
});
