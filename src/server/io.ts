import geckos, {
  iceServers,
  ServerChannel,
  GeckosServer,
} from "@geckos.io/server";
import { info } from "./util";

export class IO {
  gecko: GeckosServer;
  socket: any;

  constructor() {
    const gecko = (this.gecko = geckos({ iceServers }));
    gecko.onConnection(this.onGeckoConnect);
    gecko.listen();

    const socket = (this.socket = require("socket.io")());
    socket.on("connection", this.onSocketConnect);
    socket.listen(3000);
  }

  onGeckoConnect = (channel: ServerChannel) => {
    info("gecko connect!");
  };

  onSocketConnect = (socket: any) => {
    info("socket connect!");
  };
}
