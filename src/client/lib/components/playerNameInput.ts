import { Component } from './component';

export class PlayerNameInput extends Component<undefined, string> {
  mount() {
    const form = document.querySelector('#playerName')! as HTMLFormElement;
    const input = form.querySelector('input[type="text"]')! as HTMLInputElement;

    setTimeout(() => this.done('Ali'), 1000);

    form.onsubmit = (e: Event) => {
      const value = input.value.trim();
      if (value.length) {
        this.done(input.value);
      } else {
        alert('Please enter a value for your name');
      }
      return false;
    };
  }
}
