// Settings.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ImageBackground } from 'react-native';
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

    return (
        <ImageBackground source={require('../assets/imgaes/background2.jpg')} style={styles.container}>
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
});

export default Settings;