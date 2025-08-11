import { useEffect, useRef, useState } from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

export const useAudioMixRecording = (bookingId: string) => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [isAudioMixRecording, setIsAudioMixRecording] = useState(false);

  const connectAudioStream = (stream: MediaStream) => {
    if (!audioCtxRef.current || !destinationNodeRef.current) return;
    try {
      const sourceNode = audioCtxRef.current.createMediaStreamSource(stream);
      sourceNode.connect(destinationNodeRef.current);
    } catch (err) {
      console.error("Failed to connect audio stream:", err);
    }
  };

  const startAudioMixRecording = async () => {
    if (isAudioMixRecording) return;

    try {
      setIsAudioMixRecording(true);
      audioCtxRef.current = new AudioContext();
      destinationNodeRef.current = audioCtxRef.current.createMediaStreamDestination();

      // Local mic
      const localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      connectAudioStream(localAudioStream);

      // Remote participants
      participants.forEach((participant) => {
        const tracks =
          (participant as any).mediaTracks || (participant as any).tracks || [];
        Object.values(tracks).forEach((track: any) => {
          if (track?.kind === "audio" && track?.state === "playable" && track?.mediaStreamTrack) {
            const remoteStream = new MediaStream([track.mediaStreamTrack]);
            connectAudioStream(remoteStream);
          }
        });
      });

      // Start recording
      mediaRecorderRef.current = new MediaRecorder(destinationNodeRef.current.stream);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });

        if (audioBlob.size === 0) {
          console.warn("No audio data recorded.");
          return;
        }

        const formData = new FormData();
        formData.append("file", audioBlob, `meeting-recording-${Date.now()}.webm`);
        formData.append("bookingId", bookingId);
        try {
          const response = await fetch("/api/transcribe-recording", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Transcription request failed");

          const data = await response.json();
          setTranscript(data.transcript || "");
          console.log("Transcript:", data.transcript);
        } catch (error) {
          console.error("Transcription error:", error);
        }




        // Recording the voice mix for test purpose


    //   try {
    //     const response = await fetch("/api/save-recording", {
    //       method: "POST",
    //       body: formData,
    //     });

    //     if (!response.ok) throw new Error("Failed to save recording");
    //     console.log(" Audio mix recording saved on server");
    //   } catch (error) {
    //     console.error("Upload failed:", error);
    //   } // recording the voice mix for test purpose
    //   try {
    //     const response = await fetch("/api/save-recording", {
    //       method: "POST",
    //       body: formData,
    //     });

    //     if (!response.ok) throw new Error("Failed to save recording");
    //     console.log(" Audio mix recording saved on server");
    //   } catch (error) {
    //     console.error("Upload failed:", error);
    //   }
      };

      mediaRecorderRef.current.start();
      console.log("🎙️ Audio mix recording started...");
    } catch (error) {
      console.error("Failed to start audio recording:", error);
      setIsAudioMixRecording(false);
    }
  };

  const stopAudioMixRecording = () => {
    if (!isAudioMixRecording) return;
    try {
      mediaRecorderRef.current?.stop();
      audioCtxRef.current?.close();
      setIsAudioMixRecording(false);
      console.log("⏹️ Audio mix recording stopped.");
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  // Auto-start when participants present, stop when none remain
  useEffect(() => {
    if (participants.length > 0 && !isAudioMixRecording) {
      startAudioMixRecording();
    } else if (participants.length === 0 && isAudioMixRecording) {
      stopAudioMixRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.length]);

  // Keep adding participants’ audio streams while recording
  useEffect(() => {
    if (!isAudioMixRecording || !audioCtxRef.current || !destinationNodeRef.current) return;
    participants.forEach((participant) => {
      const tracks =
        (participant as any).mediaTracks || (participant as any).tracks || {};
      Object.values(tracks).forEach((track: any) => {
        if (track.kind === "audio" && track.state === "playable" && track.mediaStreamTrack) {
          const remoteStream = new MediaStream([track.mediaStreamTrack]);
          connectAudioStream(remoteStream);
        }
      });
    });
  }, [participants, isAudioMixRecording]);

  return {
    isAudioMixRecording,
    transcript,
    startAudioMixRecording, // still exposed in case we want manual control
    stopAudioMixRecording,
  };
};
