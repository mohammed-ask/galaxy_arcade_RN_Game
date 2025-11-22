import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';

// Sound management
const soundRefs = {};

export const initializeSounds = async () => {
    const soundEnabled = await getData('soundEnabled');
    if (!soundEnabled) return;

    soundRefs.laser = new Sound('laser.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) console.log('Error loading laser sound:', error);
        else soundRefs.laser.setVolume(0.02);
    });
    soundRefs.pop = new Sound('kill.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) console.log('Error loading pop sound:', error);
        else soundRefs.pop.setVolume(0.05);
    });
    soundRefs.bossPop = new Sound('enemybosskill.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) console.log('Error loading bossPop sound:', error);
        else soundRefs.bossPop.setVolume(0.1);
    });
    soundRefs.explosion = new Sound('explosion.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) console.log('Error loading explosion sound:', error);
        else soundRefs.explosion.setVolume(0.5);
    });
    soundRefs.powercollection = new Sound('powercollection.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) console.log('Error loading powercollection sound:', error);
        else soundRefs.powercollection.setVolume(0.2);
    });
    soundRefs.coin = new Sound('coin.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) console.log('Error loading coin sound:', error);
        else soundRefs.coin.setVolume(1.0);
    });
    soundRefs.gameOver = new Sound('game_over.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) console.log('Error loading gameOver sound:', error);
        else soundRefs.gameOver.setVolume(0.2);
    });
    soundRefs.lifeLost = new Sound('lifelost.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) console.log('Error loading lifeLost sound:', error);
        else soundRefs.lifeLost.setVolume(0.1);
    });
};

export const stopSound = (soundKey) => {
    if (soundRefs[soundKey]) {
        soundRefs[soundKey].stop();
    }
};

export const playSound = (soundKey, debounceTime = 0) => {
    if (!soundRefs[soundKey]) return;

    const now = Date.now();
    const lastPlayed = soundRefs[soundKey].lastPlayed || 0;
    if (debounceTime && now - lastPlayed < debounceTime) return;

    soundRefs[soundKey].stop();
    soundRefs[soundKey].setCurrentTime(0);
    soundRefs[soundKey].play((success) => {
        if (!success) console.log(`Error playing ${soundKey} sound`);
    });
    soundRefs[soundKey].lastPlayed = now;
};

export const cleanupSounds = () => {
    Object.values(soundRefs).forEach(sound => sound?.release());
};

// AsyncStorage utilities
export const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.log(`Error getting data for key ${key}:`, error);
        return null;
    }
};

export const setData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.log(`Error setting data for key ${key}:`, error);
    }
};

export const updateBestScore = async (currentScore, coins) => {
    const bestScore = await AsyncStorage.getItem('bestScore');
    const coinsOld = await AsyncStorage.getItem('Coins');
    if (!bestScore || currentScore > parseInt(bestScore)) {
        await AsyncStorage.setItem('bestScore', currentScore.toString());
    }
    const totalCoins = Number(coinsOld || 0) + Number(coins);
    await AsyncStorage.setItem('Coins', totalCoins.toString());
};

// General helper functions
export const isEmpty = (value) => {
    return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0);
};

export const getRandomNumber = (min = 1, max = 8) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateEvenOdd = () => {
    const num = Math.floor(Math.random() * 10) + 1;
    return num % 2 === 0;
};

// Debounce utility (for sound or input handling)
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Format time for display (if needed for TimerSystem)
export const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};