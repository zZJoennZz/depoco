import { useState, useEffect, useRef } from 'react';

export const useSpeech = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setText(currentTranscript);
    };

    recognitionRef.current = recognition;
  }, []);

  const start = () => {
    setText("");
    recognitionRef.current?.start();
    setIsListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return { text, isListening, start, stop };
};