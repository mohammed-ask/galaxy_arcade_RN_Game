// Settings.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ImageBackground, Image, ScrollView, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TouchableScale from 'react-native-touchable-scale';

const Settings = ({ navigation }) => {
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [isMusicEnabled, setIsMusicEnabled] = useState(true);

    // Load saved settings when the screen mounts
    useEffect(() => {
        loadSettings();
    }, []);

    // Load settings from AsyncStorage
    const loadSettings = async () => {
        try {
            const soundSetting = await AsyncStorage.getItem('soundEnabled');
            const musicSetting = await AsyncStorage.getItem('musicEnabled');

            if (soundSetting !== null) {
                setIsSoundEnabled(JSON.parse(soundSetting));
            }
            if (musicSetting !== null) {
                setIsMusicEnabled(JSON.parse(musicSetting));
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    // Save settings to AsyncStorage
    const saveSettings = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    // Handle sound toggle
    const toggleSound = () => {
        const newValue = !isSoundEnabled;
        setIsSoundEnabled(newValue);
        saveSettings('soundEnabled', newValue);
    };

    // Handle music toggle
    const toggleMusic = () => {
        const newValue = !isMusicEnabled;
        setIsMusicEnabled(newValue);
        saveSettings('musicEnabled', newValue);
    };

    const otherApps = [
        {
          name: 'Brain Circles',
          icon: require('../assets/imgaes/bc.png'),
          link: 'https://play.google.com/store/apps/details?id=com.braindotspro',
        },
        {
          name: 'Tell My Name',
          icon: require('../assets/imgaes/tmn.png'),
          link: 'https://play.google.com/store/apps/details?id=com.tellmyname',
        },
        {
          name: 'Awesome Editor',
          icon: require('../assets/imgaes/ae.png'),
          link: 'https://play.google.com/store/apps/details?id=com.awesomeeditor',
        },
      ];
    
      const followOn = [
        {
          name: 'Instagram',
          icon: require('../assets/imgaes/insta.png'),
          link: 'https://www.instagram.com/switch_developers/',
        },
        {
          name: 'YouTube',
          icon: require('../assets/imgaes/youtube.png'),
          link: 'https://youtube.com/@switchdevs-d3k?si=X1eX10bpMIopTEBr',
        },
        {
          name: 'Twitter',
          icon: require('../assets/imgaes/x.png'),
          link: 'https://x.com/DevsSwitch?t=T2-VvLwsenRgHMl40acrUA&s=09',
        },
        {
          name: 'Facebook',
          icon: require('../assets/imgaes/facebook.png'),
          link: 'https://www.facebook.com/share/1Biur4mkGj/',
        },
        {
          name: 'Whatsapp',
          icon: require('../assets/imgaes/whatsapp.png'),
          link: 'https://chat.whatsapp.com/HwVnCOjFawK0m9C9aAWrWd?mode=wwt',
        },
      ];

    return (
        <ImageBackground source={require('../assets/imgaes/background3.jpg')} style={styles.container}>
            <View style={styles.containerInner}>
                {/* Title */}
                <Text style={styles.title}>Settings</Text>

                {/* Sound Toggle */}
                <View style={styles.settingRow}>
                    <Text style={styles.settingText}>Sound Effects</Text>
                    <Switch
                        value={isSoundEnabled}
                        onValueChange={toggleSound}
                        trackColor={{ false: '#767577', true: '#d7b4fc' }}
                        thumbColor={isSoundEnabled ? '#6200EE' : '#f4f3f4'}
                    />
                </View>

                {/* Music Toggle */}
                <View style={styles.settingRow}>
                    <Text style={styles.settingText}>Background Music</Text>
                    <Switch
                        value={isMusicEnabled}
                        onValueChange={toggleMusic}
                        trackColor={{ false: '#767577', true: '#d7b4fc' }}
                        thumbColor={isMusicEnabled ? '#6200EE' : '#f4f3f4'}
                    />
                </View>

                {/* Back Button */}
                <TouchableScale
                    style={styles.backButton}
                    onPress={() => navigation.replace("MainMenu")}
                >
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableScale>
                <View
        style={{
          flex: 1,
          paddingHorizontal: 15,
          // flexDirection: 'row',
          // alignItems: 'center',
          justifyContent: 'flex-end',
          // alignItems: 'flex-end',
        }}>
        <Text style={{...styles.headerTitle, marginBottom: 20}}>
          More from Switch
        </Text>
        <View
          style={{flexDirection: 'row', gap: 10, marginBottom: 30}}
          horizontal>
          {otherApps.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 10,
                padding: 10,
                // elevation: 3,
              }}
              onPress={() => Linking.openURL(item.link)}>
              <Image
                source={item.icon}
                style={{width: 75, height: 75, borderRadius: 10}}
              />
              <Text
                style={{color: '#fff', fontFamily: 'Audiowide-Regular', fontSize: 10}}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{...styles.headerTitle, marginBottom: 10}}>Follow us</Text>
        <ScrollView
          style={{
            flexDirection: 'row',
            gap: 10,
            // marginBottom: 50,
            maxHeight: 80,
          }}
          contentContainerStyle={{alignItems: 'flex-end', gap: 10}}
          horizontal>
          {followOn.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                alignItems: 'center',
                // backgroundColor: 'gray',
                borderRadius: 10,
                padding: 10,
                // marginHorizontal: 5,
              }}
              onPress={() => Linking.openURL(item.link)}>
              <Image
                source={item.icon}
                style={{width: 35, height: 35, borderRadius: 10}}
              />
              <Text
                style={{color: '#fff', fontFamily: 'Audiowide-Regular',fontSize: 10}}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
            </View>
            
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#87CEEB', // Light blue background
    },
    containerInner: {
        paddingVertical: 30,
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    title: {
        fontSize: 36,
        color: '#FFF',
        fontFamily: 'Audiowide-Regular', // Use a pixelated font
        marginBottom: 25,
        marginLeft: 20,
        marginTop: 10
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        marginBottom: 20,
        alignSelf: 'center'
    },
    settingText: {
        fontSize: 18,
        color: '#FFF',
        fontFamily: 'Audiowide-Regular', // Use a pixelated font
    },
    backButton: {
        backgroundColor: '#6200EE', // Gold color for buttons
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 40,
        width: '40%',
        alignSelf: 'center'
    },
    backButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'Audiowide-Regular', // Use a pixelated font
    },

    
      headerTitle: {
        fontSize: 18,
        fontFamily: 'Audiowide-Regular',
        marginTop: 15,
        color: '#fff',
      },
});

export default Settings;