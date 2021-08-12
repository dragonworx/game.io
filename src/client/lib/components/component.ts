import { EventEmitter } from 'eventemitter3';

/**
 * A Component performs some kind of async UI behaviour and notifies when done.
 * Emits:
 *  - 'done', data: T
 *  - 'error', e: Error
 */
export class Component<I, T> extends EventEmitter {
  input?: I;

  constructor(input?: I) {
    super();
    this.input = input;
    this.mount();
  }

  mount() {}

  done(data?: T) {
    this.emit('done', data);
  }

  error(error: Error) {
    this.emit('error', error);
  }

  onDone(handler: (data: T) => void) {
    this.on('done', handler);
  }

  onError(handler: (error: Error) => void) {
    this.on('error', handler);
  }
}
