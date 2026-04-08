import { useState, useEffect, useRef } from 'react';

export const useSpeech = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  const finalTranscriptRef = useRef("");
  const recognitionRef = useRef<any>(null);
  // We use a ref for isListening to avoid closure staleness in the onend handler
  const isListeningRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setText(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onend = () => {
      // Check the Ref instead of state to ensure we have the latest value
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart recognition:", e);
        }
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const start = () => {
    finalTranscriptRef.current = "";
    setText("");
    setIsListening(true);
    isListeningRef.current = true;
    recognitionRef.current?.start();
  };

  const stop = () => {
    setIsListening(false);
    isListeningRef.current = false;
    recognitionRef.current?.stop();
  };

  // NEW: Sync manual edits back to the ref so the speech recognition 
  // continues from where you edited rather than jumping back to old text.
  const handleManualEdit = (newText: string) => {
    setText(newText);
    finalTranscriptRef.current = newText;
  };

  return { text, setText: handleManualEdit, isListening, start, stop };
};