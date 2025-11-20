import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import TimerBar from '../components/TimerBar';
import Life from '../assets/Life';
import styles from './GameStyle';
import { SHIELD_DURATION, MAGNET_DURATION, MULTIPLIER_DURATION } from './constants';

const HUD = React.memo(({ gameState, onUseMegaBomb, showBlinkingHeart, difficulty }) => {
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

    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [unlockedEnemies, setUnlockedEnemies] = useState(['asteroid']);
    const [difficultyProgress, setDifficultyProgress] = useState(0);

    const updateScore = () => {
        rotateAnim.setValue(0);
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    const rotateX = rotateAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0deg', '180deg', '0deg'],
    });

    // Update difficulty indicators when difficulty changes
    useEffect(() => {
        if (difficulty) {
            const settings = difficulty.getInfiniteProgressionSettings();
            setUnlockedEnemies(settings.unlockedEnemies);
            setDifficultyProgress(difficulty.calculateProgressBetweenMilestones());
        }
    }, [difficulty?.currentMilestone, score]);

    useEffect(() => {
        updateScore()
    }, [score])

    // Enemy icons for the difficulty indicator
    const enemyIcons = {
        'asteroid': require('../assets/imgaes/asteroid1.png'),
        'meteor': require('../assets/imgaes/asteroid1.png'),
        'mega': require('../assets/imgaes/mega.png'),
        // 'boss': require('../assets/imgaes/boss.png'),
    };

    return (
        <>
            {/* Score Display */}
            <View style={{ flexDirection: 'row', marginTop: 40, marginLeft: 25 }}>
                <Text style={styles.score}>
                    Score:
                </Text>
                <Animated.View style={{
                    transform: [{ rotateX }],
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

            {/* Difficulty Progress Bar */}
            <View style={styles.difficultyContainer}>
                <Text style={styles.difficultyText}>DIFFICULTY</Text>
                <View style={styles.difficultyBar}>
                    <View 
                        style={[
                            styles.difficultyProgress, 
                            { width: `${difficultyProgress * 100}%` }
                        ]} 
                    />
                </View>
                
                {/* Unlocked Enemies Indicator */}
                <View style={styles.enemiesContainer}>
                    {Object.keys(enemyIcons).map((enemyType, index) => (
                        <View key={enemyType} style={styles.enemyIconWrapper}>
                            <Image
                                source={enemyIcons[enemyType]}
                                style={[
                                    styles.enemyIcon,
                                    unlockedEnemies.includes(enemyType) 
                                        ? styles.enemyUnlocked 
                                        : styles.enemyLocked
                                ]}
                            />
                            {index < Object.keys(enemyIcons).length - 1 && (
                                <View style={styles.enemyConnector} />
                            )}
                        </View>
                    ))}
                </View>
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
                    top={160} // Increased top to make space for difficulty indicator
                />
            )}
            {isShieldActive && (
                <TimerBar
                    multiplierProgress={shieldDuration * 10}
                    isMultiplierActive={isShieldActive}
                    range={SHIELD_DURATION * 10}
                    top={isMultiplierActive ? 190 : 160}
                />
            )}
            {isCoinMagnetActive && (
                <TimerBar
                    multiplierProgress={coinMagnetDuration * 10}
                    isMultiplierActive={isCoinMagnetActive}
                    range={MAGNET_DURATION * 10}
                    top={isMultiplierActive && isShieldActive ? 220 : isMultiplierActive || isShieldActive ? 190 : 160}
                />
            )}
        </>
    );
});

export default HUD;