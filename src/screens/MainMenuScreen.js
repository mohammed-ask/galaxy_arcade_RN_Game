import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Modal, TextInput, useWindowDimensions, AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TouchableScale from 'react-native-touchable-scale';
import Sound from 'react-native-sound';
import { getData } from '../utils';
// import FastImage from 'react-native-fast-image';
// import { Ionicons } from '@expo/vector-icons';

const MainMenuScreen = () => {
  const navigation = useNavigation();
  const [userDetail, setUserDetail] = useState({ userName: '', bestScore: '', Coins: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameValidationError, setNameValidationError] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);
  const whooshRef = useRef(null);  // Using useRef to persist the sound object

  useEffect(() => {
    // Create the sound object when the component mounts
    whooshRef.current = new Sound('game_music_one.mp3', Sound.MAIN_BUNDLE, async (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      // loaded successfully
      console.log('duration in seconds: ' + whooshRef.current.getDuration() + ' number of channels: ' + whooshRef.current.getNumberOfChannels());
      const music = await getData('musicEnabled')

      // Play the sound with an onEnd callback
      if (music) {
        whooshRef.current.setVolume(0.1);
        whooshRef.current.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }
    });

    // Cleanup when the component unmounts
    return () => {
      if (whooshRef.current) {
        whooshRef.current.release();
      }
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App comes back to the foreground, resume sound
        if (whooshRef.current && !whooshRef.current.isPlaying()) {
          const music = await getData('musicEnabled')
          if (music) {
            whooshRef.current.play((success) => {
              if (success) {
                console.log('Sound resumed');
              } else {
                console.log('Error resuming sound');
              }
            });
          }
        }
      } else if (nextAppState === 'background') {
        // App goes to the background, pause sound
        if (whooshRef.current && whooshRef.current.isPlaying()) {
          whooshRef.current.pause();
          console.log('Sound paused');
        }
      }
      setAppState(nextAppState);
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup the event listener on component unmount
    return () => {
      subscription.remove();
    };
  }, [appState]);

  useEffect(() => {

    const checkUserDetails = async () => {
      const userName = await AsyncStorage.getItem('userName');
      const bestScore = await AsyncStorage.getItem('bestScore');
      const coins = await AsyncStorage.getItem('Coins');

      if (!userName) {
        setModalVisible(true);
      } else {
        setUserDetail({
          userName: userName || '',
          bestScore: bestScore || '0',
          Coins: coins || '0'
        });
      }
    };
    checkUserDetails();

  }, []);

  const handleSaveName = async () => {
    if (nameInput.trim() === '') {
      setNameValidationError('Please enter a valid name.')
      // Alert.alert('Error', 'Please enter a valid name.');
      return;
    }
    const sound = {
      soundEffect: true,
      music: true
    }
    const store = {
      Ships: [
        {
          id: 1,
          name: 'Stellar Voyager',
          unlock: true,
          cost: 0,
          active: true,
          specs: [],
          lives: 3,
          bulletSpeed: 200,
          bulletCombo: 2
        },
        {
          id: 2,
          name: 'Nebula Phantom',
          unlock: false,
          cost: 500,
          active: false,
          specs: ["5% Increased bullet speed"],
          lives: 3,
          bulletSpeed: 195,
          bulletCombo: 2
        },
        {
          id: 3,
          name: 'Cosmic Marauder',
          unlock: false,
          cost: 750,
          active: false,
          specs: ["12% Increased bullet speed", "One Additional Health"],
          lives: 4,
          bulletSpeed: 188,
          bulletCombo: 2
        },
        {
          id: 4,
          name: 'Quantum Drifter',
          unlock: false,
          cost: 1000,
          active: false,
          specs: ["20% Increased bullet speed", "One Additional Health"],
          lives: 4,
          bulletSpeed: 180,
          bulletCombo: 2
        },
        {
          id: 5,
          name: 'Galactic Tempest',
          unlock: false,
          cost: 1250,
          active: false,
          specs: ["20% Increased bullet speed", "Two Additional Health", "Shoots 3 Bullets after level Up"],
          lives: 5,
          bulletSpeed: 180,
          bulletCombo: 3
        },
        {
          id: 6,
          name: 'Void Seeker',
          unlock: false,
          cost: 1500,
          active: false,
          specs: ["30% Increased bullet speed", "Two Additional Health", "Shoots 3 Bullets after level Up"],
          lives: 5,
          bulletSpeed: 170,
          bulletCombo: 3
        },
      ],
      powerUps: [
        {
          name: 'shield',
          level: 1,
          upgradeCost: 300,
          maxLevel: 7,
          duration: 10
        },
        {
          name: 'coinMagnet',
          level: 1,
          maxLevel: 7,
          upgradeCost: 200,
          duration: 10
        },
        {
          name: 'multiplier',
          level: 1,
          maxLevel: 7,
          upgradeCost: 150,
          duration: 10
        },
      ]
    }
    await AsyncStorage.setItem('userName', nameInput);
    await AsyncStorage.setItem('bestScore', '0');
    await AsyncStorage.setItem('Coins', '0');
    // await AsyncStorage.setItem('Setting', JSON.stringify(sound));
    await AsyncStorage.setItem('soundEnabled', 'true');
    await AsyncStorage.setItem('musicEnabled', 'true');
    await AsyncStorage.setItem('Store', JSON.stringify(store));

    setUserDetail({ userName: nameInput, bestScore: '0', Coins: '0' });
    setModalVisible(false);
  };

  const handleNavigation = (screenName, replace) => {
    if (replace) {
      navigation.replace(screenName)
    } else {
      navigation.navigate(screenName)

    }
  }

  return (
    <ImageBackground source={require('../assets/imgaes/background2.jpg')} style={styles.background}>
      <View style={styles.container}>
        <View style={{ marginHorizontal: 15, paddingVertical: 5, borderRadius: 30, borderWidth: 5, borderColor: '#000', width: 100, backgroundColor: '#6200EE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Image source={require('../assets/imgaes/goldcoin.gif')} style={styles.coin} />
          <Text style={{ color: '#fff', fontFamily: 'Audiowide-Regular' }}>{userDetail.Coins}</Text>
        </View>
        <Text style={styles.title}>Hyy, {userDetail.userName}</Text>
        <Text style={styles.score}>Best Score: {userDetail.bestScore}</Text>
        <TouchableScale style={styles.button} onPress={() => handleNavigation('Game', true)}>
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableScale>
        <TouchableScale style={styles.button} onPress={() => handleNavigation('Shop', true)}>
          <Text style={styles.buttonText}>Shop</Text>
        </TouchableScale>
        <TouchableScale style={styles.button} onPress={() => handleNavigation('Leaderboard')}>
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableScale>
        <TouchableScale style={styles.button} onPress={() => handleNavigation('Settings', true)}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableScale>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Image
            source={require('../assets/imgaes/spaceship.png')}
            style={{
              position: 'absolute',
              width: 50,
              height: 50,
              top: '58%',
              left: '48%',
            }}
          />
          <Text style={styles.text}>GAL{'  '}XY ARCADE</Text>
        </View>
      </View>

      {/* Modal for User Name Input */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent]}>
            <Text style={styles.modalTitle}>Enter Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#aaa"
              value={nameInput}
              onChangeText={setNameInput}
            />
            {nameValidationError ? <Text style={{ color: 'red', fontFamily: 'Audiowide-Regular', fontSize: 8 }}>{nameValidationError}</Text> : null}
            <TouchableOpacity style={styles.modalButton} onPress={() => handleSaveName()}>
              <Text style={styles.modalButtonText}>🚀 Launch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  spinningIcon: {
    width: 60,
    height: 60,
    // tintColor: '#FFD700'
  },
  text: {
    textAlign: 'center',
    fontSize: 40,
    color: '#fff',
    fontFamily: 'Audiowide-Regular'
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingVertical: 30,
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: 25,
    color: '#FFF',
    fontFamily: 'Audiowide-Regular',
    marginLeft: 20,
    marginTop: 10
  },
  score: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 40,
    fontFamily: 'Audiowide-Regular',
    marginLeft: 20
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '50%',
    alignSelf: 'center'
  },
  buttonText: {
    fontSize: 20,
    color: '#FFF',
    fontFamily: 'Audiowide-Regular',
    textAlign: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    borderWidth: 3,
    borderColor: '#6200EE',
    elevation: 10
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    fontFamily: 'Audiowide-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#6200EE',
    borderRadius: 10,
    width: '100%',
    padding: 12,
    // marginBottom: 20,
    textAlign: 'center',
    color: '#FFF',
    backgroundColor: '#333',
    fontFamily: 'Audiowide-Regular',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#fff'
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Audiowide-Regular',
  },
  coin: {
    width: 20, // Adjust based on image size
    height: 20,
  },
});

export default MainMenuScreen;
