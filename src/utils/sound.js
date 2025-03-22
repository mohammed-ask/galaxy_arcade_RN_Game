import Sound from 'react-native-sound';

const soundRefs = {};

export const initializeSounds = async () => {
    const soundEnabled = true; // Replace with actual logic from AsyncStorage
    if (!soundEnabled) return;

    soundRefs.laser = new Sound('laser.wav', Sound.MAIN_BUNDLE, (error) => {
        if (!error) soundRefs.laser.setVolume(0.02);
    });
    soundRefs.pop = new Sound('kill.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (!error) soundRefs.pop.setVolume(0.05);
    });
    soundRefs.gameOver = new Sound('game_over.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (!error) soundRefs.gameOver.setVolume(0.2);
    });
    // Add other sounds (coin, explosion, etc.)
};

export const playSound = (soundKey) => {
    if (soundRefs[soundKey]) {
        soundRefs[soundKey].stop();
        soundRefs[soundKey].setCurrentTime(0);
        soundRefs[soundKey].play();
    }
};

export const cleanupSounds = () => {
    Object.values(soundRefs).forEach(sound => sound?.release());
};