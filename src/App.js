import React, { useState } from 'react';
import { ReactMic } from 'react-mic';

const RecordingWidget = () => {
  const [isRecording, setIsRecording] = useState(false);  // Toggle for recording
  const [audioUrl, setAudioUrl] = useState('');           // Backend audio file URL

  // Toggle Recording
  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Called when recording stops, handles file upload
  const onStop = async (recordedBlob) => {
    console.log('Recording stopped:', recordedBlob);

    // Create FormData object to hold the file
    const formData = new FormData();
    formData.append('file', recordedBlob.blob, 'output.mp3');

    try {
      // POST the recorded file to the backend
      const response = await fetch('https://40ba-88-99-162-157.ngrok-free.app/', {
      // const response = await fetch('http://localhost:8080', {
        method: 'POST',
        body: formData,
      });

      console.log('Uploaded audio file:', response);
      // // Get the file URL from the backend response
      if (response.ok) {
        // Convert the response to a Blob (MP3 file)
        const mp3Blob = await response.blob();

        // Create a temporary URL for the MP3 file
        const audioUrl = URL.createObjectURL(mp3Blob);

        // Set the audioUrl to the state so it can be played
        setAudioUrl(audioUrl);
      } else {
        console.error('Failed to upload audio file.');
      }
      
    } catch (error) {
      console.error('Error uploading audio file:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <ReactMic
        record={isRecording}
        onStop={onStop}
        mimeType="audio/mp3"
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />
      {/* Circular Record Button */}
      <button
        onClick={handleToggleRecording}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#FF4081',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px',
        }}
      >
        {isRecording ? 'Stop' : 'Record'}
      </button>

      {/* Audio Playback */}
      {audioUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>Playing Uploaded MP3:</p>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </div>
  );
};

export default RecordingWidget;
