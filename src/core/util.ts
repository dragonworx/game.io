export type Point = [number, number];
export type Rect = [number, number, number, number];

export const vertexKey = (h: number, v: number) => `${h}:${v}`;

export const edgeKey = (fromVertexKey: string, toVertexKey: string) =>
  `${fromVertexKey}-${toVertexKey}`;
