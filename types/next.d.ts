import { Server as HTTPServer } from "http";
import { Socket } from "net";
import { Server as IOServer } from "socket.io";

export type NextApiResponseWithSocket = {
  socket: Socket & {
    server: HTTPServer & {
      io: IOServer;
    };
  };
};
