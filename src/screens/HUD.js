import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
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

    return (
        <>
            {/* Score Display */}
            <Text style={styles.score}>
                Score: {score}{isMultiplierActive ? ' x2' : ''}
            </Text>

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
                    top={isMultiplierActive || isCoinMagnetActive ? 150 : 120}
                />
            )}
            {isCoinMagnetActive && (
                <TimerBar
                    multiplierProgress={coinMagnetDuration * 10}
                    isMultiplierActive={isCoinMagnetActive} // Coin magnet doesn’t use multiplier styling
                    range={MAGNET_DURATION * 10}
                    top={isMultiplierActive || isShieldActive ? 150 : 120}
                />
            )}
        </>
    );
});

export default HUD;