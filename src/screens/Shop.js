import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const BlueGlowCircle = () => {
    // Create an animated value for the glow intensity
    const glowAnim = useRef(new Animated.Value(0)).current;

    // Function to animate the glow
    const animateGlow = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1, // Maximum glow intensity
                    duration: 1500, // Slower animation for subtlety
                    easing: Easing.linear,
                    useNativeDriver: false, // `shadow` properties are not supported by native driver
                }),
                Animated.timing(glowAnim, {
                    toValue: 0, // Minimum glow intensity
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    };

    // Start the animation when the component mounts
    useEffect(() => {
        animateGlow();
    }, []);

    // Interpolate the animated value for shadowRadius, shadowOpacity, and backgroundColor
    const shadowRadius = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [5, 15], // Larger radius for a stronger glow
    });

    const shadowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.4], // Reduced opacity for a more transparent glow
    });

    const backgroundColor = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(30, 144, 255, 0.3)', 'rgba(30, 144, 255, 0.6)'], // Blue glow (dodger blue)
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.glowCircle,
                    {
                        shadowRadius: shadowRadius, // Animated shadow radius
                        shadowOpacity: shadowOpacity, // Animated shadow opacity
                        backgroundColor: backgroundColor, // Animated blue background color (glowing effect)
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000', // Dark background for better glow visibility
    },
    glowCircle: {
        width: 100, // Diameter of the circle
        height: 100, // Diameter of the circle
        borderRadius: 50, // Half of width/height to make it a circle
        backgroundColor: 'rgba(30, 144, 255, 0.3)', // Initial transparent blue background
        shadowColor: '#1E90FF', // Blue glow color (dodger blue)
        shadowOffset: { width: 0, height: 0 }, // Shadow position
        elevation: 5, // For Android shadow
    },
});

export default BlueGlowCircle;
