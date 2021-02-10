import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { staticRooms } from "../../mocks/rooms";
import { mediaConfiguration } from "../../mocks/mediaConfiguration";
import { iceServers } from "../../mocks/iceServers";

import { useWebRTC } from "../../utils/useWebRTC";

const Room = () => {
  const router = useRouter();
  const { id } = router.query;

  const roomId = parseInt(id as string);

  const [isCreator, setIsCreator] = useState<boolean>(false);

  let localVideoComponent = useRef<HTMLVideoElement>(null);
  let remoteVideoComponent = useRef<HTMLVideoElement>(null);
  let localStream: any;
  let remoteStream: any;
  let rtcPeerConnection = useRef<RTCPeerConnection | null>(null);

  const setLocalStream = async () => {
    let stream: MediaStream;

    stream = await navigator.mediaDevices.getUserMedia(mediaConfiguration);

    localStream = stream;
    if (localVideoComponent !== null && localVideoComponent.current !== null) {
      localVideoComponent.current.srcObject = stream;
    }
  };

  const addLocalTracks = () => {
    localStream.getTracks().forEach((track: any) => {
      if (rtcPeerConnection !== null && rtcPeerConnection.current !== null) {
        rtcPeerConnection.current.addTrack(track, localStream);
      }
    });
  };

  const createOffer = async (socket: SocketIOClient.Socket) => {
    let sessionDescription;
    try {
      if (rtcPeerConnection !== null && rtcPeerConnection.current !== null) {
        sessionDescription = await rtcPeerConnection.current.createOffer();
        rtcPeerConnection.current.setLocalDescription(sessionDescription);
      }
    } catch (error) {
      console.error(error);
    }

    socket.emit("webrtc_offer", {
      sdp: sessionDescription,
      roomId,
    });
  };

  const createAnswer = async (socket) => {
    let sessionDescription;
    try {
      if (rtcPeerConnection !== null && rtcPeerConnection.current !== null) {
        sessionDescription = await rtcPeerConnection.current.createAnswer();
        rtcPeerConnection.current.setLocalDescription(sessionDescription);
      }
    } catch (error) {
      console.error(error);
    }

    socket.emit("webrtc_answer", {
      type: "webrtc_answer",
      sdp: sessionDescription,
      roomId,
    });
  };

  const setRemoteStream = (event) => {
    if (
      remoteVideoComponent !== null &&
      remoteVideoComponent.current !== null
    ) {
      remoteVideoComponent.current.srcObject = event.streams[0];
      remoteStream = event.stream;
    }
  };

  const sendIceCandidate = (socket, event) => {
    if (event.candidate) {
      socket.emit("webrtc_ice_candidate", {
        roomId,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
      });
    }
  };

  useWebRTC({
    roomId,
    isCreator,
    onRoomCreated: async () => {
      console.log("onRoomCreated");
      setIsCreator(true);
      await setLocalStream();
    },
    onRoomJoined: async (socket) => {
      await setLocalStream();
      socket.emit("start_call", roomId);
    },
    onStartCall: async (socket: SocketIOClient.Socket) => {
      if (isCreator) {
        console.log({ rtcPeerConnection });
        if (rtcPeerConnection !== null) {
          rtcPeerConnection.current = new RTCPeerConnection({ iceServers });
          addLocalTracks();
          rtcPeerConnection.current.ontrack = setRemoteStream;
          rtcPeerConnection.current.onicecandidate = (event) =>
            sendIceCandidate(socket, event);
          await createOffer(socket);
        }
      }
    },
    onFullRoom: () => {},
    onWebRtcAnswer: (event) => {
      if (rtcPeerConnection !== null && rtcPeerConnection.current !== null) {
        rtcPeerConnection.current.setRemoteDescription(
          new RTCSessionDescription(event)
        );
      }
    },
    onWebRtcIceCandidate: (event) => {
      const candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate,
      });
      if (rtcPeerConnection !== null && rtcPeerConnection.current !== null) {
        rtcPeerConnection.current.addIceCandidate(candidate);
      }
    },
    onWebRtcOffer: async (socket, event) => {
      if (!isCreator) {
        if (rtcPeerConnection !== null) {
          rtcPeerConnection.current = new RTCPeerConnection({ iceServers });
          addLocalTracks();
          rtcPeerConnection.current.ontrack = setRemoteStream;
          rtcPeerConnection.current.onicecandidate = (event) =>
            sendIceCandidate(socket, event);
          rtcPeerConnection.current.setRemoteDescription(
            new RTCSessionDescription(event)
          );
          await createAnswer(socket);
        }
      }
    },
  });

  return (
    <>
      <div>
        Estás en la {staticRooms.find((room) => room.id === roomId)?.name}
      </div>
      <div id="video-chat-container" className="video-position">
        <video ref={localVideoComponent} id="local-video" autoPlay></video>
        <video ref={remoteVideoComponent} id="remote-video" autoPlay></video>
      </div>
    </>
  );
};
export default Room;
