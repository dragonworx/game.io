import { ServerApp } from './app';
import logger from 'node-color-log';

console.clear();
logger.setLevel('debug');
logger.color('white').bgColor('blue').log('Server starting up');

export default ServerApp;
