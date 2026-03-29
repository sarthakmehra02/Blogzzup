import React, { useRef, useState } from 'react';
import styles from './VoiceRecorder.module.css';
import { transcribeAudio } from './utils/whisperTranscribe';

export default function VoiceRecorder({ onTranscriptReady, onRecordingStateChange }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micBlocked, setMicBlocked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Start recording
  const startRecording = async () => {
    setError("");
    setTranscript("");
    setTimer(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();
      setIsRecording(true);
      onRecordingStateChange?.(true);
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t >= 59) {
            stopRecording();
            return 60;
          }
          return t + 1;
        });
      }, 1000);
    } catch (err) {
      if (err && err.name === "NotAllowedError") {
        setError("Microphone access denied — please allow it in your browser settings");
      } else {
        setError("Microphone access denied or unavailable.");
      }
      setError("Microphone access denied — please allow it in your browser settings");
      setIsRecording(false);
      onRecordingStateChange?.(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    onRecordingStateChange?.(false);
    clearInterval(timerRef.current);
  };

  // Handle stop event
  const handleStop = async () => {
    setIsTranscribing(true);
    setError('');
    try {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const transcriptText = await transcribeAudio(blob);
      setTranscript(transcriptText);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      onTranscriptReady?.(transcriptText);
    } catch (err) {
      setError('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Check microphone permission on mount
  React.useEffect(() => {
    if (navigator?.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' })
        .then((result) => {
          setMicBlocked(result.state === 'denied');
        })
        .catch(() => {
          setMicBlocked(false);
        });
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className={styles.voiceRecorder}>
      {micBlocked && (
        <div style={{background:"rgba(245,158,11,0.1)",color:"#F59E0B",border:"1px solid rgba(245,158,11,0.2)",borderRadius:"8px",padding:"10px",fontSize:"13px",marginBottom:"12px"}}>
          Microphone access is blocked. Go to browser Settings 
          
          




















→ Site Settings → Microphone to allow access.
        </div>
      )}
      <button
        className={isRecording ? styles.micButtonActive : styles.micButton}
        onClick={isRecording ? undefined : startRecording}
        disabled={isRecording || isTranscribing}
        aria-label={isRecording ? 'Recording...' : 'Start recording'}
        title="Click to start recording (max 60 seconds)"
      >
        <span className={styles.micIcon} />
        {isRecording && <span className={styles.pulse} />}
        {isRecording && (
          <span className={styles.waveform} aria-hidden="true">
            {[0,1,2,3,4].map(i => (
              <span key={i} className={styles.waveBar} />
            ))}
          </span>
        )}
      </button>
      <div className={styles.statusArea}>
        {micBlocked && (
          <span className={styles.error}>Microphone access is blocked. Please enable it in your browser settings.</span>
        )}
        {isRecording && (
          <>
            <span className={
              timer >= 50 ? styles.timerWarning : styles.timer
            }>
              {`${Math.floor(timer/60)}:${(timer%60).toString().padStart(2,'0')}`}
            </span>
            <button className={styles.stopButton} onClick={stopRecording}>
              Stop early
            </button>
          </>
        )}
        {isTranscribing && <span className={styles.transcribing}>Transcribing...</span>}
        {error && <span className={styles.error}>{error}</span>}
        {!isRecording && !isTranscribing && transcript && (
          <div className={styles.transcriptBox}>
            {showSuccess && (
              <div style={{background:"rgba(16,185,129,0.1)",color:"#10B981",borderRadius:"8px",padding:"8px 12px",fontSize:"13px",marginBottom:"8px"}}>
                ✓ Transcription complete — review and edit below
              </div>
            )}
            <label className={styles.transcriptLabel} htmlFor="voice-txt">Your voice note — edit before generating</label>
            <textarea
              id="voice-txt"
              className={styles.transcriptTextarea}
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              rows={3}
            />
            <div style={{fontSize:"12px",color:"#64748B",textAlign:"right",marginTop:"4px"}}>
              {transcript.length} characters · ~{Math.ceil((transcript.trim() ? transcript.trim().split(/\s+/).length : 0) / 200)} min read
            </div>
            <div className={styles.transcribedBy}>✓ Transcribed by Whisper AI</div>
          </div>
        )}
        {showSuccess && <div className={styles.successMessage}>Transcription successful!</div>}
      </div>
    </div>
  );
}
