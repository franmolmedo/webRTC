import { useEffect } from "react";

import io from "socket.io-client";

type UseWebRTCProps = {
  roomId: number;
  isCreator: boolean;
  onRoomCreated: () => Promise<void>;
  onRoomJoined: (socket: SocketIOClient.Socket) => Promise<void>;
  onFullRoom: () => void;
  onStartCall: (socket: SocketIOClient.Socket) => Promise<void>;
  onWebRtcOffer: (socket: SocketIOClient.Socket, event: any) => Promise<void>;
  onWebRtcAnswer: (event: any) => void;
  onWebRtcIceCandidate: (event: any) => void;
};

const useWebRTC = ({
  roomId,
  isCreator,
  onRoomCreated,
  onRoomJoined,
  onFullRoom,
  onStartCall,
  onWebRtcOffer,
  onWebRtcAnswer,
  onWebRtcIceCandidate,
}: UseWebRTCProps) => {
  useEffect(() => {
    const socket = io();
    socket.on("room_created", async () => {
      console.log("Socket event callback: room_created");
      await onRoomCreated();
    });

    socket.on("room_joined", async () => {
      console.log("Socket event callback: room_joined");
      await onRoomJoined(socket);
    });

    socket.on("full_room", async () => {
      console.log("Socket event callback: full_room");
      await onFullRoom();
    });

    socket.on("start_call", async () => {
      console.log("Socket event callback: start_call");
      await onStartCall(socket);
    });

    socket.on("webrtc_offer", async (event: any) => {
      console.log("Socket event callback: webrtc_offer");
      await onWebRtcOffer(socket, event);
    });

    socket.on("webrtc_answer", (event: any) => {
      console.log("Socket event callback: webrtc_answer");
      onWebRtcAnswer(event);
    });

    socket.on("webrtc_ice_candidate", (event) => {
      console.log("Socket event callback: webrtc_ice_candidate");
      onWebRtcIceCandidate(event);
    });

    socket.emit("join", roomId);

    return () => {
      socket.off("room_created");
      socket.off("room_joined");
      socket.off("full_room");
      socket.off("start_call");
      socket.off("webrtc_offer");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice_candidate");
      socket.disconnect();
    };
  }, [isCreator]);
};

export { useWebRTC };
