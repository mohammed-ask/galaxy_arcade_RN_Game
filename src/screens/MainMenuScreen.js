import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Modal, TextInput, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TouchableScale from 'react-native-touchable-scale';
// import FastImage from 'react-native-fast-image';
// import { Ionicons } from '@expo/vector-icons';

const MainMenuScreen = () => {
  const navigation = useNavigation();
  const [userDetail, setUserDetail] = useState({ userName: '', bestScore: '', Coins: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameValidationError, setNameValidationError] = useState('');

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
    await AsyncStorage.setItem('userName', nameInput);
    await AsyncStorage.setItem('bestScore', '0');
    await AsyncStorage.setItem('Coins', '0');

    setUserDetail({ userName: nameInput, bestScore: '0', Coins: '0' });
    setModalVisible(false);
  };

  const handleNavigation = (screenName) => {
    navigation.navigate(screenName)
  }

  return (
    <ImageBackground source={require('../assets/imgaes/background2.jpg')} style={styles.background}>
      <View style={styles.container}>
        <View style={{ marginHorizontal: 15, paddingVertical: 5, borderRadius: 30, borderWidth: 5, borderColor: '#000', width: 100, backgroundColor: '#6200EE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {/* <FastImage
            resizeMode="contain"
            style={{ width: 70, height: 70 }}
            source={require('../assets/imgaes/goldcoin.gif')}
          /> */}
          <Image source={require('../assets/imgaes/goldcoin.gif')} style={styles.coin} />
          <Text style={{ color: '#fff', fontFamily: 'Audiowide-Regular' }}>{userDetail.Coins}</Text>
        </View>
        <Text style={styles.title}>Hyy, {userDetail.userName}</Text>
        <Text style={styles.score}>Best Score: {userDetail.bestScore}</Text>
        <TouchableScale style={styles.button} onPress={() => handleNavigation('Game')}>
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableScale>
        <TouchableScale style={styles.button} onPress={() => handleNavigation('Upgrades')}>
          <Text style={styles.buttonText}>Shop</Text>
        </TouchableScale>
        <TouchableScale style={styles.button} onPress={() => handleNavigation('Leaderboard')}>
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableScale>
        <TouchableScale style={styles.button} onPress={() => handleNavigation('Settings')}>
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
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveName}>
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
