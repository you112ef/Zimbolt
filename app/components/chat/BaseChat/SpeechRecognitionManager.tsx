// app/components/chat/BaseChat/SpeechRecognitionManager.tsx
import React, { useEffect, useState } from 'react';
import { SpeechRecognitionButton } from '../SpeechRecognition';

interface SpeechRecognitionManagerProps {
  isStreaming?: boolean;
  handleStop?: () => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  sendMessage?: (event: React.UIEvent<HTMLTextAreaElement>, messageInput?: string) => void;
}

export function SpeechRecognitionManager({
  isStreaming,
  handleStop,
  handleInputChange,
  sendMessage,
}: SpeechRecognitionManagerProps) {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }

    const sr = new SpeechRecognitionConstructor();
    sr.continuous = true;
    sr.interimResults = true;

    sr.onresult = (event: SpeechRecognitionEvent) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');

      setTranscript(text);

      // If parent is controlling the textarea, we simulate a change event
      if (handleInputChange) {
        const syntheticEvent = {
          target: { value: text },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        handleInputChange(syntheticEvent);
      }
    };

    sr.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    setRecognition(sr);
    return () => {
      sr.abort();
      setRecognition(null);
    };
  }, [handleInputChange]);

  // Optional: do something with transcript in real-time
  useEffect(() => {
    if (transcript) {
      // console.log('Transcript: ', transcript);
    }
  }, [transcript]);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex items-center gap-2 my-2">
      <SpeechRecognitionButton
        isListening={isListening}
        onStart={startListening}
        onStop={stopListening}
        disabled={isStreaming}
      />
      {/* 
        Optionally: if you want to auto-stop listening when user sends a message,
        you could listen for "sendMessage" calls or handleStop calls here.
      */}
    </div>
  );
}
