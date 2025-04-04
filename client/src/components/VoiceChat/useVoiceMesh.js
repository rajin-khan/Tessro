import { useEffect, useRef, useState } from 'react';

export function useVoiceMesh(socket, sessionId, selfId, setPeerMuteStates) {
  const [isMuted, setIsMuted] = useState(false);
  const [connected, setConnected] = useState(false);

  const peersRef = useRef({});
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (!socket || !sessionId) return;

    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setConnected(true);
        socket.emit('voice:ready', { sessionId });
      } catch (err) {
        console.error('[voice] Mic access denied:', err);
      }
    };

    setupMedia();

    // When another peer is ready and sends an offer
    socket.on('voice:offer', async ({ from, offer }) => {
      const peer = new RTCPeerConnection();
      localStreamRef.current.getTracks().forEach(track =>
        peer.addTrack(track, localStreamRef.current)
      );

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('voice:candidate', { to: from, candidate: e.candidate });
        }
      };

      peer.ontrack = (e) => {
        const audio = new Audio();
        audio.srcObject = e.streams[0];
        audio.autoplay = true;
      };

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      peersRef.current[from] = peer;

      socket.emit('voice:answer', { to: from, answer });
    });

    socket.on('voice:answer', async ({ from, answer }) => {
      const peer = peersRef.current[from];
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('voice:candidate', async ({ from, candidate }) => {
      const peer = peersRef.current[from];
      if (peer && candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('voice:ready', async ({ userId }) => {
      if (userId === selfId) return;

      const peer = new RTCPeerConnection();
      peersRef.current[userId] = peer;

      localStreamRef.current.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('voice:candidate', { to: userId, candidate: e.candidate });
        }
      };

      peer.ontrack = (e) => {
        const audio = new Audio();
        audio.srcObject = e.streams[0];
        audio.autoplay = true;
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('voice:offer', { to: userId, offer });
    });

    // ✅ Mute status sync
    socket.on('voice:mute_status', ({ userId, muted }) => {
      setPeerMuteStates?.((prev) => ({
        ...prev,
        [userId]: muted
      }));
    });

    return () => {
      for (const peer of Object.values(peersRef.current)) {
        peer.close();
      }
      peersRef.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      socket.off('voice:mute_status');
    };
  }, [socket, sessionId, selfId, setPeerMuteStates]);

  const toggleMute = () => {
    if (!localStreamRef.current) return;

    const newMuted = !isMuted;
    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = !newMuted;
    });
    setIsMuted(newMuted);

    socket.emit('voice:mute_status', { sessionId, muted: newMuted });
  };

  return {
    isMuted,
    connected,
    toggleMute,
  };
}