import { useState, useRef, useCallback } from 'react';

export const useLocalRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // First, try to get the display media (which includes the video call)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Get user microphone audio separately for better quality
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
            sampleSize: 16
          }
        });
      } catch (micError) {
        console.warn('Could not access microphone for recording:', micError);
      }

      // Combine the streams for the best recording quality
      let recordingStream = displayStream;
      
      if (micStream) {
        // Create audio context to mix audio streams
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();
        
        // Add display audio if available
        if (displayStream.getAudioTracks().length > 0) {
          const displayAudioSource = audioContext.createMediaStreamSource(displayStream);
          displayAudioSource.connect(destination);
        }
        
        // Add microphone audio
        const micAudioSource = audioContext.createMediaStreamSource(micStream);
        micAudioSource.connect(destination);
        
        // Create combined stream with display video and mixed audio
        recordingStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...destination.stream.getAudioTracks()
        ]);
      }

      streamRef.current = recordingStream;

      // Check for supported MIME types and choose the best one
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      const mediaRecorder = new MediaRecorder(recordingStream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
        audioBitsPerSecond: 128000   // 128 kbps for good audio quality
      });

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        setRecordedBlob(blob);
        setShowDownloadModal(true);
        
        // Stop all tracks to release the streams
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.warn('Recording failed:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const downloadRecording = useCallback(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setShowDownloadModal(false);
    setRecordedBlob(null);
  }, [recordedBlob]);

  const discardRecording = useCallback(() => {
    setShowDownloadModal(false);
    setRecordedBlob(null);
  }, []);

  return {
    isRecording,
    recordedBlob,
    showDownloadModal,
    startRecording,
    stopRecording,
    downloadRecording,
    discardRecording
  };
};
