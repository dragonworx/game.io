import { EventEmitter } from 'eventemitter3';

export class PlayerNameInput extends EventEmitter {
  constructor() {
    super();

    const form = document.querySelector('#playerName')! as HTMLFormElement;
    form.onsubmit = () => {
      const input = form.querySelector(
        'input[type="text"]',
      )! as HTMLInputElement;
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
