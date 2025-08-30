import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, Animated, Easing } from 'react-native';

const SplashScreen = ({ navigation }) => {

    const rocketY = useRef(new Animated.Value(0)).current; // Start from below the center

    useEffect(() => {
        // Wait 2 seconds, then start upward animation
        const startAnimation = setTimeout(() => {
            Animated.timing(rocketY, {
                toValue: -1000, // Moves rocket upward
                duration: 4000, // Adjust speed here
                easing: Easing.linear,
                useNativeDriver: true,
            }).start();
        }, 1000);

        // Navigate after 6 seconds
        const navigateTimeout = setTimeout(() => {
            navigation.replace('MainMenu');
        }, 3000);

        return () => {
            clearTimeout(startAnimation);
            clearTimeout(navigateTimeout);
        };
    }, [navigation, rocketY]);

    return (
        <ImageBackground source={require('../assets/imgaes/background3.jpg')} style={styles.container}>
            <Animated.Image
                source={require('../assets/imgaes/spaceship.png')}
                style={{
                    position: 'absolute',
                    width: 60,
                    height: 60,
                    top: '42%',
                    left: '46%',
                    transform: [{ translateY: rocketY }],
                }}
            />
            <Text style={styles.text}>GAL{'  '}XY ARCADE</Text>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        textAlign: 'center',
        fontSize: 50,
        color: '#fff',
        // fontWeight: 'bold',
        fontFamily: 'Audiowide-Regular'
    },
});

export default SplashScreen;