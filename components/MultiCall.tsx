"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const ROOM_ID = "default";

type PeerConnections = { [socketId: string]: RTCPeerConnection };

export default function MultiPeerVideoChat() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const peerConnections = useRef<PeerConnections>({});
  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const socket = io({ path: "/api/socketio" });
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("join-room", ROOM_ID);
        });

        socket.on("all-users", (users: string[]) => {
          users.forEach((userId) => {
            console.log("ALLUSERS: ", userId);
            if (userId !== socket.id) createOffer(userId);
          });
        });

        socket.on("user-joined", (userId: string) => {
          if (userId !== socket.id) {
            console.log("USERJOINED: ", userId);
            createOffer(userId);
          }
        });

        socket.on("offer", async ({ from, sdp }) => {
          await handleOffer(from, sdp);
        });

        socket.on("answer", async ({ from, sdp }) => {
          await handleAnswer(from, sdp);
        });

        socket.on("ice-candidate", async ({ from, candidate }) => {
          await handleNewICECandidate(from, candidate);
        });

        socket.on("user-disconnected", (userId: string) => {
          closePeerConnection(userId);
        });
      } catch (err) {
        console.error("カメラ・マイク取得失敗", err);
      }
    }

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      setRemoteStreams([]);
      peerConnections.current = {};
    };
  }, []);

  function createPeerConnection(userId: string) {
    if (peerConnections.current[userId]) return peerConnections.current[userId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", { to: userId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setRemoteStreams((prev) => {
        if (prev.find((s) => s.id === remoteStream.id)) return prev;
        return [...prev, remoteStream];
      });
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnections.current[userId] = pc;
    return pc;
  }

  async function createOffer(userId: string) {
    const pc = createPeerConnection(userId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (socketRef.current) {
      socketRef.current.emit("offer", { to: userId, sdp: pc.localDescription });
    }
  }

  async function handleOffer(userId: string, sdp: RTCSessionDescriptionInit) {
    const pc = createPeerConnection(userId);

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (socketRef.current) {
      socketRef.current.emit("answer", { to: userId, sdp: pc.localDescription });
    }
  }

  async function handleAnswer(userId: string, sdp: RTCSessionDescriptionInit) {
    const pc = peerConnections.current[userId];
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async function handleNewICECandidate(userId: string, candidate: RTCIceCandidateInit) {
    const pc = peerConnections.current[userId];
    if (!pc) return;
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  function closePeerConnection(userId: string) {
    const pc = peerConnections.current[userId];
    if (pc) {
      pc.close();
      delete peerConnections.current[userId];
      setRemoteStreams((streams) =>
        streams.filter((s) => {
          // userIdと直接紐づけられないため、
          // peerConnectionsが持つstream IDの管理を追加すれば良い
          return true; // 今は削除処理保留
        })
      );
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: "0 0 200px", padding: 10 }}>
        <h2>自分の映像</h2>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "320px", borderRadius: 8, backgroundColor: "black" }}
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <h2>参加者の映像</h2>
        <SplitView streams={remoteStreams} />
      </div>
    </div>
  );
}

function SplitView({ streams }: { streams: MediaStream[] }) {
  const count = streams.length;
  let columns = 1;
  if (count === 2) columns = 2;
  else if (count === 3 || count === 4) columns = 2;
  else if (count > 4) columns = 3;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "8px",
        padding: "8px",
        height: "100%",
      }}
    >
      {streams.map((stream) => (
        <VideoPlayer key={stream.id} stream={stream} />
      ))}
    </div>
  );
}

function VideoPlayer({ stream }: { stream: MediaStream }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: 8,
        backgroundColor: "black",
      }}
    />
  );
}
