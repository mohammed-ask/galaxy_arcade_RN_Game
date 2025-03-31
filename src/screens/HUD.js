import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import TimerBar from '../components/TimerBar'; // Assuming this is your TimerBar component
import Life from '../assets/Life'; // Assuming this is your Life component
import styles from './GameStyle';
import { SHIELD_DURATION, MAGNET_DURATION, MULTIPLIER_DURATION } from './constants';

const HUD = React.memo(({ gameState, onUseMegaBomb, showBlinkingHeart }) => {
    const {
        score,
        lives,
        coins,
        megaBombCount,
        isMultiplierActive,
        multiplierDuration,
        isShieldActive,
        shieldDuration,
        isCoinMagnetActive,
        coinMagnetDuration,
    } = gameState;

    // const [scoreAnim, setScoreAnim] = useState(score);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const updateScore = () => {
        rotateAnim.setValue(0);
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    // Interpolate the rotation on the X-axis for a vertical flip
    const rotateX = rotateAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0deg', '180deg', '0deg'], // Full vertical flip
    });

    useEffect(() => {
        updateScore()
    }, [score])

    return (
        <>
            {/* Score Display */}
            <View style={{ flexDirection: 'row', marginTop: 40, marginLeft: 25 }}>
                <Text style={styles.score}>
                    Score:
                </Text>
                <Animated.View style={{
                    transform: [
                        // { perspective: 1000 }, // Adds 3D depth
                        { rotateX }, // Vertical flip
                    ],
                    // Anchor the flip point to avoid excessive movement
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Text
                        style={{ color: 'white', fontSize: 24, fontFamily: 'Audiowide-Regular' }}
                    >
                        {score}
                    </Text>
                </Animated.View>
                <Text style={{ ...styles.score }}>{isMultiplierActive ? ' x2' : ''}</Text>
            </View>
            {/* Lives Display */}
            <View style={styles.lives}>
                {Array(lives).fill().map((_, i) => (
                    <Life key={i} isVisible={true} />
                ))}
                {showBlinkingHeart ?
                    <Life isVisible={false} /> : null}
            </View>

            {/* Coins Display */}
            <View style={styles.coinContainer}>
                <Image
                    source={require('../assets/imgaes/goldcoin.gif')}
                    style={styles.coin}
                />
                <Text style={styles.coinText}>{coins}</Text>
            </View>

            {/* Mega Bomb Display */}
            <TouchableOpacity
                onPress={() => onUseMegaBomb()}
                style={styles.megaBombContainer}
                disabled={megaBombCount === 0}
            >
                <Image
                    source={require('../assets/imgaes/bomb.gif')}
                    style={styles.megaBombIcon}
                />
                <Text style={styles.megaBombCount}>{megaBombCount}</Text>
            </TouchableOpacity>

            {/* Power-up Timer Bars */}
            {isMultiplierActive && (
                <TimerBar
                    multiplierProgress={multiplierDuration * 10}
                    isMultiplierActive={isMultiplierActive}
                    range={MULTIPLIER_DURATION * 10}
                    top={120}
                />
            )}
            {isShieldActive && (
                <TimerBar
                    multiplierProgress={shieldDuration * 10}
                    isMultiplierActive={isShieldActive} // Shield doesn’t use multiplier styling
                    range={SHIELD_DURATION * 10}
                    top={isMultiplierActive ? 150 : 120}
                />
            )}
            {isCoinMagnetActive && (
                <TimerBar
                    multiplierProgress={coinMagnetDuration * 10}
                    isMultiplierActive={isCoinMagnetActive} // Coin magnet doesn’t use multiplier styling
                    range={MAGNET_DURATION * 10}
                    top={isMultiplierActive && isShieldActive ? 180 : isMultiplierActive || isShieldActive ? 150 : 120}
                />
            )}
        </>
    );
});

export default HUD;