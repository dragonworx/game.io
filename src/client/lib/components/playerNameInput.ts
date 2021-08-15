import { EventEmitter } from 'eventemitter3';

export class PlayerNameInput extends EventEmitter {
  constructor() {
    super();
    const form = document.querySelector('#playerName')! as HTMLFormElement;
    const input = form.querySelector('input[type="text"]')! as HTMLInputElement;

    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if (name) {
      input.value = name;
    }

    // testing
    setTimeout(() => this.emit('submit', input.value), 2000);

    form.onsubmit = () => {
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
