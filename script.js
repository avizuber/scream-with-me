document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('myVideo');
  const startButton = document.getElementById('startButton');
  const overlay = document.getElementById('overlay');

  video.muted = true;
  video.loop = true;

  const start = async () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(async (stream) => {
        try {
          await video.play();
          console.log('Video started playing');
        } catch (error) {
          console.error('Error playing video:', error);
        }

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 512; // Reduced fftSize value for faster analysis
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;

          if (average <= 10) { // Increased the threshold for rewinding
            video.currentTime = Math.max(0, video.currentTime - 0.016); // Rewind the video manually
          } else if (average <= 20) { // Increased the threshold for the minimum playback rate
            video.playbackRate = 0.1; // Set the minimum playback rate
          } else {
            video.playbackRate = Math.min(3, Math.max(0.1, (average - 20) / 5)); // Clamp the playback rate within the range of 0.1 to 3
          }
        };

        setInterval(update, 16); // Update the video more frequently using setInterval
      })
      .catch(err => console.error('Error accessing microphone:', err));
  };

  startButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    start();
  });
});
