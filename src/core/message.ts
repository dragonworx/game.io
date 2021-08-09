export interface Message<T> {
  type: string;
  payload: T;
}

export enum Events {
  UPDConnect = 'updConnect',
  SocketConnect = 'socketConnect',
  UPDRegister = 'updRegister',
  SocketRegister = 'socketRegister',
  UPDMessage = 'updMessage',
  SocketMessage = 'socketMessage',
  Connected = 'connected',
  Disconnected = 'disconnected',
  UPDConnectError = 'updConnectError',
  UPDDisconnect = 'updDisconnect',
  SocketDisconnect = 'socketDisconnect',
  ClientConnected = 'clientConnected',
}
