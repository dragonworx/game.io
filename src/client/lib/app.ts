import { IO } from './io';
import { Graphics } from './graphics';
import { Grid } from '../../core/grid';
import { GridView } from './gridView';
import { Events } from '../../core/message';

export const GridDivisions = 10;
export const GridSize = 500;
export const GridMargin = 20;

export class App {
  io: IO;
  grid: Grid;
  graphics: Graphics;
  gridView: GridView;

  constructor() {
    const io = (this.io = new IO());
    io.on(Events.Connected, this.onConnected);

    const grid = (this.grid = new Grid(
      GridSize,
      GridSize,
      GridDivisions,
      GridDivisions,
    ));

    const graphicsSize = GridSize + GridMargin * 2;
    const graphics = (this.graphics = new Graphics(graphicsSize, graphicsSize));

    this.gridView = new GridView(grid, graphics, GridMargin);
  }

  onConnected = () => {
    console.log('Connected ' + this.io.id);
  };
}
