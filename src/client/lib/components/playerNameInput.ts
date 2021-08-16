import { EventEmitter } from 'eventemitter3';
import { AudioPlayer } from '../audio';

export class PlayerNameInput extends EventEmitter {
  constructor(audio: AudioPlayer) {
    super();
    const form = document.querySelector('#playerName')! as HTMLFormElement;
    const input = form.querySelector('input[type="text"]')! as HTMLInputElement;

    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if (name) {
      input.value = name;
    }

    // testing
    // setTimeout(() => this.emit('submit', input.value), 0);

    form.onsubmit = () => {
      audio.play('music');
      const value = input.value.trim();
      if (value.length) {
        this.emit('submit', input.value);
      } else {
        alert('Please enter a value for your name');
      }
      return false;
    };
  }
}
