import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const TimerBar = ({ isMultiplierActive, multiplierProgress, range, top }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Animate the progress bar when multiplierProgress changes
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: multiplierProgress,
            duration: 1000, // Smooth animation over 1 second
            useNativeDriver: false, // Required for width animation
        }).start();
    }, [multiplierProgress]);

    // Determine gradient colors based on progress
    const getGradientColors = () => {
        const progressPercentage = (multiplierProgress / range) * 100;
        if (progressPercentage >= 56) {
            return ['orange', '#00CC00']; // Green gradient
        } else if (progressPercentage >= 33) {
            return ['red', '#FF8C00']; // Orange gradient
        } else {
            return ['#670000', 'red']; // Red gradient
        }
    };

    return (
        <View style={{ ...styles.durationBarContainer, top: top, display: isMultiplierActive ? 'flex' : 'none' }}>
            <View style={styles.durationBarBackground}>
                {/* Striped Pattern */}
                <View style={styles.stripedPattern} />
                {/* Progress Bar */}
                <Animated.View
                    style={[
                        styles.durationBar,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, range],
                                outputRange: ['0%', `100%`],
                            }),
                        },
                    ]}
                >
                    <LinearGradient
                        colors={getGradientColors()} // Dynamic gradient based on progress
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </Animated.View>
            </View>
            <View style={styles.durationBarOverlay} />
        </View>
    );
};

const styles = StyleSheet.create({
    durationBarContainer: {
        position: 'absolute',
        top: 120, // Adjust position as needed
        left: '35%', // Center the bar
        transform: [{ translateX: -100 }], // Adjust for centering (half of width)
        width: 100, // Wider bar for better visibility
        height: 15, // Slightly thicker bar
        borderRadius: 10, // Rounded corners
        overflow: 'hidden', // Ensure the inner bar stays within bounds
    },
    durationBarBackground: {
        width: '100%',
        height: '100%',
        backgroundColor: '#444', // Darker background for contrast
        borderRadius: 10, // Match container's border radius
        overflow: 'hidden', // Ensure stripes stay within bounds
    },
    durationBar: {
        height: '100%',
        borderRadius: 10, // Match container's border radius
        overflow: 'hidden', // Ensure gradient stays within bounds
    },
    gradient: {
        flex: 1,
    },
    durationBarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent overlay for depth
        borderRadius: 10, // Match container's border radius
    },
    stripedPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent)',
        backgroundSize: '10px 10px', // Stripe size
    },
});

export default TimerBar;