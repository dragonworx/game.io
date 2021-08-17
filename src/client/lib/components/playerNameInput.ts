import { EventEmitter } from 'eventemitter3';
import { AudioPlayer } from '../audio';

export class PlayerNameInput extends EventEmitter {
  constructor(audio: AudioPlayer) {
    super();
    const div = document.querySelector('#playerName')! as HTMLDivElement;
    const input = div.querySelector('input')! as HTMLInputElement;
    const button = div.querySelector('.button')! as HTMLButtonElement;

    try {
      const name = window.localStorage.getItem('game_name');
      if (name) {
        input.value = name;
      }
    } catch (e) {}

    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if (name) {
      input.value = name;
    }

    input.onkeyup = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        button.click();
      }
    };

    const handler = () => {
      const value = input.value.trim();
      if (value.length) {
        audio.play('music');
        this.emit('submit', input.value);
        button.removeEventListener('click', handler);
        try {
          window.localStorage.setItem('game_name', value);
        } catch (e) {}
      } else {
        alert('Please, just enter a value for your name ok?');
      }
      return false;
    };

    button.addEventListener('click', handler);
  }
}
