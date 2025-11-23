// LevelUpOverlay.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

export default function LevelUpOverlay({ levelModalVisible, onHide, duration = 1200 }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const scaleAnim = useRef(new Animated.Value(0)).current;
      const fadeAnim = useRef(new Animated.Value(0)).current;
  
    const openModal = () => {
        setLevelModalVisible(true);
        // Reset animations
        scaleAnim.setValue(0);
        fadeAnim.setValue(0);

        // Start animations
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1.5,
                duration: 800,
                easing: Easing.elastic(1.2),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setLevelModalVisible(false);
        });
    };

    useEffect(() => {
        if (modalVisible) {
            setTimeout(() => {
                closeModal();
            }, 1000);
        }
    }, [modalVisible]);

  if (!levelModalVisible) return null;

  return (
    // pointerEvents box-none ensures touches pass through to the game
    <View style={styles.overlay} pointerEvents="box-none">
      {/* animated bubble does not receive touches either (pointerEvents="none") */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bubble,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Text style={styles.text}>LEVEL UP!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    // don't obscure the game with a dim layer; remove/comment if you want dim
    backgroundColor: 'transparent',
    zIndex: 9999,
  },
  bubble: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.95)', // tweak to taste
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  text: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
