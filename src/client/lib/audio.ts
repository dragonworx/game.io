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
      'ouch0.mp3',
      'ouch1.mp3',
      'ouch2.mp3',
      'ouch3.mp3',
      'ouch4.mp3',
      'ouch5.mp3',
      'ouch6.mp3',
      'ouch7.mp3',
      'ouch8.mp3',
      'ouch9.mp3',
      'highscore.mp3',
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
    const sound = this.sounds.get(path + '.mp3')!;
    sound.play();
    if (!this.hasShownButton) {
      this.button.classList.remove('hidden');
      this.hasShownButton = true;
    }
    return sound;
  }

  mute() {
    this.sounds.forEach(sound => sound.stop());
  }
}
