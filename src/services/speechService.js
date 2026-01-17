import * as Speech from 'expo-speech';

// Text-to-Speech (leer mensajes)
export const speakText = (text) => {
  Speech.speak(text, {
    language: 'es-ES',
    pitch: 1.0,
    rate: 0.9,
  });
};

// Detener reproducción
export const stopSpeaking = () => {
  Speech.stop();
};

// Speech-to-Text (para implementar más adelante)
export const startRecording = async () => {
  console.log('Recording feature coming soon...');
  return null;
};

export const stopRecording = async () => {
  console.log('Stop recording...');
  return null;
};
