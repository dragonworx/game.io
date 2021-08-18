import {
  GameState,
  GameStatus,
  PlayerInfo,
  PlayerPositionInfo,
  gameStatusToString,
  CodeToAction,
  InitialFPS,
  PlayerJoinedInfo,
} from '../../common';
import { Graphics, PIXI } from './graphics';
import { ClientPlayer } from './player';
import { Alert } from './components/alert';
import { HighScore } from './components/highscore';
import { ClientSocketEvents } from '../../common/messaging';
import { Grid } from '../../common/grid';
import { GridView } from './gridView';
import { ClientIO } from './io';
import { AudioPlayer } from './audio';

export class ClientGame {
  io: ClientIO;
  graphics: Graphics;
  audio: AudioPlayer;
  players: ClientPlayer[] = [];
  status: GameStatus = GameStatus.Unconnected;
  grid: Grid;
  gridView: GridView;
  userPlayer?: ClientPlayer;

  constructor(
    io: ClientIO,
    graphics: Graphics,
    audio: AudioPlayer,
    gridSize: number,
    gridDivisions: number,
    gridMargin: number,
  ) {
    this.io = io;
    this.graphics = graphics;
    const grid = (this.grid = new Grid(gridSize, gridDivisions, gridMargin));
    grid.on(
      'cut',
      (_clientId: string, cellCount: number) =>
        cellCount > 0 && this.audio.play('break'),
    );

    this.gridView = new GridView(grid, graphics);
    this.audio = audio;
  }

  newPlayer(playerInfo: PlayerInfo, tint: number) {
    const { players, graphics, io, grid, gridView, audio } = this;

    const player = new ClientPlayer(
      this,
      grid,
      io,
      playerInfo,
      graphics,
      audio,
      gridView,
      tint,
    );
    players.push(player);
    return player;
  }

  joinPlayer(joinInfo: PlayerJoinedInfo) {
    const { graphics, io } = this;
    const { cid, n, tint } = joinInfo;
    const player = this.newPlayer({ cid, n }, tint);
    if (cid === io.clientId) {
      this.userPlayer = player;
    }
    const alert = new Alert(graphics, `"${n}" joined!`);
    alert.on('shown', () => {
      const [x, y] = player.position;
      alert.hide(x, y);
    });
    alert.show();
    document.querySelector('#playerStatus')!.classList.add('visible');
  }

  removePlayer(clientId: string) {
    const { players, graphics } = this;
    const index = players.findIndex(player => player.info.cid === clientId);
    if (index > -1) {
      const player = players[index];
      players.splice(index, 1);
      player.dispose();
      const alert = new Alert(graphics, `"${player.info.n}" disconnected!`);
      alert.on('shown', () => alert.hide(graphics.center[0], this.grid.margin));
      alert.show();
    }
  }

  getPlayer(clientId: string) {
    return this.players.find(player => player.info.cid === clientId)!;
  }

  preInit() {
    this.gridView.init(this.players);
    this.updateFPSInfo(InitialFPS);
  }

  updatePlayerInitialPositions(info: PlayerPositionInfo[]) {
    info.forEach(info => {
      const player = this.getPlayer(info.cid);
      player.setInitialPosition(info);
    });
  }

  showCountdown() {
    const { graphics, grid, audio } = this;
    const alert = new Alert(graphics, `Get ready in 3...`);
    alert.on('shown', () => {
      setTimeout(() => {
        alert.text.text = `Get ready in 2...`;
        setTimeout(() => {
          alert.text.text = `Get ready in 1...`;
          setTimeout(() => {
            this.audio.play('go');
            graphics.ease(alert.text, { scale: 2.0 }, 500, 'easeOutBack');
            alert.text.text = `Go!`;
            const [x, y] = grid.innerBounds.center;
            alert.hide(x, y);
          }, 1000);
        }, 1000);
      }, 1000);
    });
    alert.show();
  }

  updateGameStatus(status: GameStatus) {
    this.status = status;
    document.querySelector('#gameStatus span')!.innerHTML =
      gameStatusToString(status);
  }

  hidePlayerNameInput() {
    const playerName = document.querySelector('#playerName')!;
    playerName.classList.add('ready');
    playerName.classList.remove('expanded');
    playerName.classList.add('collapsed');
  }

  showPlayerNameInput() {
    const playerName = document.querySelector('#playerName')!;
    playerName.classList.remove('ready');
    playerName.classList.remove('collapsed');
    playerName.classList.add('expanded');
  }

  init() {
    this.showCountdown();
    this.grid.init();
    this.players.forEach(player => player.gameInit());
    if (this.userPlayer) {
      this.bindInputEvents();
    }
  }

  start() {
    console.log('Game start');
    this.updateGameStatus(GameStatus.Running);
    this.players.forEach(player => player.gameStart());
    document.querySelector('#canvas')!.classList.add('no-cursor');
  }

  stop() {
    console.log('Game stop');
    this.updateGameStatus(GameStatus.Over);
    if (this.userPlayer) {
      this.unbindInputEvents();
    }
    document.querySelector('#canvas')!.classList.remove('no-cursor');
  }

  bindInputEvents() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  unbindInputEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e: KeyboardEvent) => {
    const { code } = e;
    const numericCode = CodeToAction[code];
    if (numericCode !== undefined) {
      this.io.messageUDP(ClientSocketEvents.SocketPlayerInput, numericCode);
    }
  };

  remoteUpdate(gameState: GameState) {
    this.status = gameState.s;
    this.updateFPSInfo(gameState.f);
    gameState.p.forEach(info => {
      const player = this.getPlayer(info.cid);
      player.remoteUpdate(info, this.userPlayer);
    });
  }

  updateFPSInfo(fps: number) {
    document.querySelector('#fps span')!.innerHTML = `${fps.toFixed(1)}`;
  }

  showGameOver(playerRank: PlayerPositionInfo[]) {
    const { graphics, audio, grid, gridView } = this;
    playerRank.forEach(info => {
      const player = this.getPlayer(info.cid);
      player.remoteUpdate(info, this.userPlayer);
    });
    audio.play('gameover');
    audio.sounds.get('music.mp3')!.stop();
    gridView.gameOver();
    const isWinner = playerRank[0].cid === this.io.clientId;
    const alert = new Alert(graphics, isWinner ? 'Winner!' : 'Game Over!');
    alert.on('shown', () => alert.hide(graphics.center[0], grid.size));
    alert.show();
    alert.on('hidden', () => {
      audio.play('highscore');
      new HighScore(graphics, playerRank).show().on('shown', () => {
        const playerName = document.querySelector(
          '#playerName',
        )! as HTMLFormElement;
        playerName.querySelector('label')!.style.display = 'none';
        playerName.classList.remove('ready');
        playerName.classList.remove('collapsed');
        playerName.classList.add('expanded');
        const button = playerName.querySelector(
          '.button',
        )! as HTMLButtonElement;
        button.innerHTML = 'Reload!';
        button.focus();
        button.addEventListener('mouseup', (e: Event) => {
          e.preventDefault();
          window.location.reload();
          return false;
        });
      });
    });
  }
}
