import React, { useState, useRef } from 'react';

const SpeechRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunks = useRef([]);

  const toggleRecording = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        processSpeechToText(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
    } else {
      mediaRecorder.stop();
    }

    setIsRecording(!isRecording);
  };

  const processSpeechToText = async (audioBlob) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const audioBase64 = reader.result.split(',')[1];

      const response = await fetch('https://speech.googleapis.com/v1/speech:recognize?key=YOUR_API_KEY', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: { content: audioBase64 },
          config: { encoding: 'WEBM_OPUS', sampleRateHertz: 16000, languageCode: 'en-US' },
        }),
      });

      const data = await response.json();
      const transcript = data.results[0].alternatives[0].transcript;

      sendTextToBackend(transcript);
    };

    reader.readAsDataURL(audioBlob);
  };

  const sendTextToBackend = async (transcript) => {
    try {
      const response = await fetch('http://localhost:8000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcript }),
      });

      if (!response.ok) {
        throw new Error('Failed to send text to backend');
      }

      const data = await response.json();
      console.log('Received text file from backend:', data.textFile);

      // Pass the text to the TTS step
      convertTextToSpeech(data.textFile);
    } catch (error) {
      console.error('Error in sending text to backend:', error);
    }
  };

  const convertTextToSpeech = async (text) => {
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=YOUR_API_KEY', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text: text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    });

    const data = await response.json();
    const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
    playAudio(audioSrc);
  };

  const playAudio = (audioSrc) => {
    const audio = new Audio(audioSrc);
    audio.play();
  };

  return (
    <div>
      <button onClick={toggleRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default SpeechRecorder;
