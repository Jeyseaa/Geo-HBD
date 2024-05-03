document.addEventListener('DOMContentLoaded', function() {
  // Access all available audio input devices
  navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      var audioInputDevices = devices.filter(function(device) {
        return device.kind === 'audioinput';
      });

      // Prompt the user to select an audio input device
      var audioInputDevice = null;
      if (audioInputDevices.length > 0) {
        audioInputDevice = audioInputDevices[0].deviceId; // Select the first available device by default
      }

      // Access the selected audio input device
      navigator.mediaDevices.getUserMedia({ audio: { deviceId: audioInputDevice } })
        .then(function(stream) {
          // Create an audio context
          var audioContext = new AudioContext();
          var analyser = audioContext.createAnalyser();
          var microphone = audioContext.createMediaStreamSource(stream);

          // Connect the microphone to the analyser
          microphone.connect(analyser);

          // Set up the analyser
          analyser.fftSize = 2048;
          var bufferLength = analyser.frequencyBinCount;
          var dataArray = new Uint8Array(bufferLength);

          // Function to detect blowing
          function detectBlow() {
            analyser.getByteFrequencyData(dataArray);
            // Analyze dataArray to detect blowing
            if (isBlowDetected(dataArray)) {
              // Hide the flame element
              document.querySelector('.flame').style.display = 'none';

              // Play the "hbd.mp3" sound file
              var audio = new Audio('hbd.mp3');
              audio.play();
            }

            // Repeat the detection
            requestAnimationFrame(detectBlow);
          }

          // Start blow detection
          detectBlow();
        })
        .catch(function(err) {
          console.error('Error accessing microphone:', err);
        });
    })
    .catch(function(err) {
      console.error('Error enumerating audio devices:', err);
    });
});

// Function to detect blowing
function isBlowDetected(audioData) {
  // Calculate the average amplitude of the frequency data
  var sum = audioData.reduce((acc, val) => acc + val, 0);
  var averageAmplitude = sum / audioData.length;

  // Define a threshold amplitude level
  var threshold = 100;

  // Check if the average amplitude exceeds the threshold
  if (averageAmplitude > threshold) {
    return true; // Blow is detected
  } else {
    return false; // No blow detected
  }
}
