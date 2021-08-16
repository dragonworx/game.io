import { Howl, Howler } from 'howler';

export class AudioPlayer {
  button: HTMLButtonElement;
  isEnabled: boolean = true;
  sounds: Map<string, Howl>;
  hasShownButton: boolean = false;

  constructor() {
    const button = (this.button = document.querySelector(
      '#audio',
    )! as HTMLButtonElement);
    button.addEventListener('click', this.onButtonClick);
    this.updateButtonImage();
    this.sounds = new Map();
    this.preload();
  }

  onButtonClick = () => {
    this.isEnabled = !this.isEnabled;
    this.updateButtonImage();
    if (this.isEnabled) {
      this.play('music');
    } else {
      this.mute();
    }
  };

  updateButtonImage() {
    const { isEnabled, button } = this;
    const img = button.querySelector('img')! as HTMLImageElement;
    img.src = isEnabled ? 'audio-on.png' : 'audio-off.png';
    img.title = isEnabled
      ? 'Audio is on - Turn it off'
      : 'Audio is off - Turn it on';
  }

  preload() {
    [
      'music.mp3',
      'break.mp3',
      'dead.mp3',
      'fire.mp3',
      'gameover.mp3',
      'go.mp3',
      'damage.mp3',
    ].forEach(path => this.preloadSound(path));
  }

  preloadSound(path: string) {
    const sound = new Howl({
      src: [path],
      loop: path === 'music.mp3',
    });
    this.sounds.set(path, sound);
  }

  play(path: string) {
    if (!this.isEnabled) {
      return;
    }
    console.log('Play audio: ' + path);
    this.sounds.get(path + '.mp3')!.play();
    if (!this.hasShownButton) {
      this.button.classList.remove('hidden');
      this.hasShownButton = true;
    }
  }

  mute() {
    this.sounds.forEach(sound => sound.stop());
  }
}
