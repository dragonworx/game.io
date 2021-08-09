import { IO } from './io';
import { Grid } from '../../core/grid';
import { GridView } from './gridView';

export const GridDivisions = 10;
export const GridSize = 500;
export const GridMargin = 20;

export class App {
  io: IO;
  grid: Grid;
  gridView: GridView;

  constructor() {
    this.io = new IO();

    const grid = (this.grid = new Grid(
      GridSize,
      GridSize,
      GridDivisions,
      GridDivisions,
    ));

    const gridView = (this.gridView = new GridView(grid, GridMargin));
  }
}
