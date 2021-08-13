import { App } from './app';
import logger from 'node-color-log';

console.clear();
logger.setLevel('debug');
logger.color('white').bgColor('blue').log('Server starting up');

new App();
