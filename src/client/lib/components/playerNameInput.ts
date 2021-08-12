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

    form.onsubmit = (e: Event) => {
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
