import React, { useRef, useEffect, useState } from 'react';
import { View, Modal, Text, ImageBackground, StatusBar, AppState, BackHandler, Dimensions, Animated, Easing, TouchableOpacity } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TouchableScale from 'react-native-touchable-scale';
import Sound from 'react-native-sound';
import {
    Physics, MoveShip, BulletShooter, AsteroidSpawner, CoinSpawner, MegaBombSpawner,
    MultiplierSpawner, ShieldSpawner, CoinMagnetSpawner, CoinAttractionSystem,
    handleCollisions, CleanupEntities, MoveMega, TimerSystem, initializeSystems,
    useMegaBomb,
    resetCollision
} from './systems';
import { createShip } from './entities';
import { shipSize, spaceShipIcons, SHIELD_DURATION, MAGNET_DURATION, MULTIPLIER_DURATION, updatePowerUp, preloadAssets } from './constants';
import { initializeSounds, cleanupSounds, getData, updateBestScore, stopSound, playSound } from './utils';
import HUD from './HUD';
import Spaceship from '../assets/Spaceship';
import styles from './GameStyle';
import Explosion from '../assets/Explosion';
import { ProgressiveDifficulty } from './progressiveDifficulty';

const { width, height } = Dimensions.get('screen');

export default function GameScreen({ navigation }) {
    const gameEngine = useRef(null);
    const engineRef = useRef(Matter.Engine.create({ enableSleeping: true }));
    engineRef.current.positionIterations = 4;   // default 6
    engineRef.current.velocityIterations = 2;   // default 4
    engineRef.current.constraintIterations = 1; // default 2
    const worldRef = useRef(engineRef.current.world);
    const shipRef = useRef(createShip());
    const entitiesRef = useRef({});
    const whooshRef = useRef(null);
    const progressiveDifficultyRef = useRef(null);

    const gameStateRef = useRef({
        lives: 3,
        score: 0,
        coins: 0,
        megaBombCount: 0,
        elapsedTime: 0,
        enemySpeedMultiplier: 0,
        levelUp: false,
        level3: false,
        megaSpawned: false,
        isShieldActive: false,
        shieldDuration: 0,
        isCoinMagnetActive: false,
        coinMagnetDuration: 0,
        isMultiplierActive: false,
        multiplierDuration: 0,
        isPowerUpActive: false,
        isCoinsActive: false,
        bulletSpeed: 200,
        bulletCombo: 2,
        magnetTimeoutId: null,
        shieldTimeoutId: null
    });

    const [displayScore, setDisplayScore] = useState(0);
    const [displayCoins, setDisplayCoins] = useState(0);
    const [displayLives, setDisplayLives] = useState(3);
    const [displayMegaBombCount, setDisplayMegaBombCount] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gamePause, setGamePause] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);
    const [showBlinkingHeart, setShowBlinkingHeart] = useState(false);
    const [coinMagnetDuration, setCoinMagnetDuration] = useState(0);
    const [shieldDuration, setShieldDuration] = useState(0);
    const [multiplierDuration, setMultiplierDuration] = useState(0);
    const [gameStart, setGameStart] = useState(false);
    const [levelModalVisible, setLevelModalVisible] = useState(false);
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

    useEffect(() => {
        const initializeGame = async () => {
            const music = await getData('musicEnabled');
            if (music) {
                whooshRef.current = new Sound('game_music_two.mp3', Sound.MAIN_BUNDLE, (error) => {
                    if (error) {
                        console.log('Failed to load game music:', error);
                        return;
                    }
                    whooshRef.current.setVolume(0.1);
                    whooshRef.current.play();
                });
            }
            await preloadAssets();
            setTimeout(async () => {
                await resetGame();
                progressiveDifficultyRef.current = new ProgressiveDifficulty(gameStateRef);
                // Pass setters to systems.js
                initializeSystems(entitiesRef, gameStateRef, shipRef, {
                    setDisplayScore,
                    setDisplayCoins,
                    setDisplayLives,
                    setDisplayMegaBombCount,
                    setGameOver,
                    setCoinMagnetDuration,
                    setMultiplierDuration,
                    setShieldDuration,
                    setShowBlinkingHeart,
                    openModal,
                    closeModal
                },progressiveDifficultyRef.current);
                setGameStart(true);
            }, 3000);
        };

        initializeGame();

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            appStateSubscription.remove();
            Matter.Engine.clear(engineRef.current);
            if (whooshRef.current) whooshRef.current.release();
            cleanupSounds();
        };
    }, []);

    const handleAppStateChange = async (nextAppState) => {
        const music = await getData('musicEnabled');
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            if (whooshRef.current && music && !whooshRef.current.isPlaying()) {
                whooshRef.current.play();
            }
        } else if (nextAppState === 'background') {
            if (whooshRef.current && whooshRef.current.isPlaying()) {
                whooshRef.current.pause();
            }
            pauseGame();
        }
        setAppState(nextAppState);
    };

    // Reset game when the component mounts
    useEffect(() => {
        // Handle back button press
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            pauseGame() // Stop the game when back button is pressed
            setShowPauseModal(true) // Navigate back to the previous screen
            return true; // Prevent default behavior
        });

        return () => {
            stopGame();
        };
    }, []);

    // Stop the game
    const stopGame = () => {
        console.log('gamestop')
        Matter.Engine.clear(engineRef.current); // Stop the physics engine
        Matter.World.clear(worldRef.current, false);
        if (gameEngine.current) {
            gameEngine.current.stop(); // Stop the GameEngine
        }
    };

    useEffect(() => {
        if (showBlinkingHeart) {
            setInterval(() => {
                setShowBlinkingHeart(false)
            }, 600);
        }
    }, [showBlinkingHeart])

    // Reset game state
    const resetGame = async () => {
        console.log('game reset')
        initializeSounds();
        // Clear existing engine and event listeners
        if (engineRef.current) {
            Matter.Events.off(engineRef.current); // Remove all event listeners
            Matter.Engine.clear(engineRef.current);
        }

        // Reinitialize engine and world
        engineRef.current = Matter.Engine.create({ enableSleeping: true });
        engineRef.current.positionIterations = 4;   // default 6
        engineRef.current.velocityIterations = 2;   // default 4
        engineRef.current.constraintIterations = 1; // default 2
        worldRef.current = engineRef.current.world;
        shipRef.current = createShip();

        // Reset physics world
        Matter.World.clear(worldRef.current, false);
        Matter.World.add(worldRef.current, shipRef.current);

        const gameData = await getData('Store');
        const activeShip = gameData?.Ships?.find(ship => ship.active) || { lives: 3, bulletSpeed: 200, bulletCombo: 2, id: 1 };
        const powerUps = gameData?.powerUps || [
            { duration: SHIELD_DURATION },
            { duration: MAGNET_DURATION },
            { duration: MULTIPLIER_DURATION },
        ];
        updatePowerUp(powerUps)

        gameStateRef.current = {
            lives: activeShip.lives,
            score: 0,
            coins: 0,
            megaBombCount: 0,
            elapsedTime: 0,
            enemySpeedMultiplier: 0,
            levelUp: false,
            level3: false,
            megaSpawned: false,
            isShieldActive: false,
            shieldDuration: 0,
            isCoinMagnetActive: false,
            coinMagnetDuration: 0,
            isMultiplierActive: false,
            multiplierDuration: 0,
            isPowerUpActive: false,
            isCoinsActive: false,
            bulletSpeed: activeShip.bulletSpeed,
            bulletCombo: activeShip.bulletCombo,
            magnetTimeoutId: null,
            shieldTimeoutId: null
        };

        entitiesRef.current = {
            physics: { engine: engineRef.current, world: worldRef.current },
            spaceship: {
                body: shipRef.current,
                size: [shipSize, shipSize],
                renderer: Spaceship,
                isVisible: true,
                showShield: false,
                showMagnet: false,
                activeShipIcon: spaceShipIcons[activeShip.id - 1]?.source,
            },
        };

        setGameOver(false);
        setGamePause(false);
        setModalVisible(false);
        setShowPauseModal(false);
        setDisplayScore(0);
        setDisplayCoins(0);
        setDisplayLives(activeShip.lives);
        setDisplayMegaBombCount(0);
        gameEngine.current?.swap(entitiesRef.current);
        resetCollision()
    };

    useEffect(() => {
        if (gameStateRef.current.lives <= 0 && !gameOver) {
            updateBestScore(gameStateRef.current.score, gameStateRef.current.coins);
            setTimeout(() => {
                setGameOver(true);
                setModalVisible(true);
            }, 300);
            setTimeout(() => {
                cleanupSounds()
            }, 1500);
            stopGame()
        }

    }, [gameStateRef.current.lives, gameStateRef.current.score]);

    useEffect(() => {
        const intervals = [];
        if (gameStateRef.current.shieldDuration > 0) {
            intervals.push(setInterval(() => {
                gameStateRef.current.shieldDuration -= 1;
                setShieldDuration(prev => prev - 1)
                if (gameStateRef.current.shieldDuration <= 0) {
                    gameStateRef.current.isShieldActive = false;
                    entitiesRef.current.spaceship.showShield = false;
                }
            }, 1000));
        }
        if (gameStateRef.current.coinMagnetDuration > 0) {
            intervals.push(setInterval(() => {
                gameStateRef.current.coinMagnetDuration -= 1;
                setCoinMagnetDuration(prev => prev - 1)
                if (gameStateRef.current.coinMagnetDuration <= 0) {
                    gameStateRef.current.isCoinMagnetActive = false;
                    entitiesRef.current.spaceship.showMagnet = false;
                }
            }, 1000));
        }
        if (gameStateRef.current.multiplierDuration > 0) {
            intervals.push(setInterval(() => {
                gameStateRef.current.multiplierDuration -= 1;
                setMultiplierDuration(prev => prev - 1)
                if (gameStateRef.current.multiplierDuration <= 0) {
                    gameStateRef.current.isMultiplierActive = false;
                }
            }, 1000));
        }
        return () => intervals.forEach(clearInterval);
    }, [
        gameStateRef.current.shieldDuration,
        gameStateRef.current.coinMagnetDuration,
        gameStateRef.current.multiplierDuration,
    ]);

    const pauseGame = () => {
        setGamePause(true);
        updateBestScore(gameStateRef.current.score, gameStateRef.current.coins);
        stopSound('laser');
        setShowPauseModal(true);
    };

    const handleMegaBomb = () => {
        if (gameStateRef.current.megaBombCount > 0) {
            gameStateRef.current.megaBombCount -= 1;
            entitiesRef.current = useMegaBomb(entitiesRef.current); // Import from systems.js
        }
        // try {
        //     if (gameStateRef.current.megaBombCount > 0) {
        //         gameStateRef.current.megaBombCount -= 1;
        //         setDisplayMegaBombCount(gameStateRef.current.megaBombCount);
        //         Object.keys(entitiesRef.current).forEach(key => {
        //             const entity = entitiesRef.current[key];
        //             if (entity.body && ['asteroid', 'meteor', 'mega'].includes(entity.body.label)) {
        //                 Matter.World.remove(worldRef.current, entity.body);
        //                 delete entitiesRef.current[key];
        //             }
        //         });
        //         const explosion = Matter.Bodies.circle(width / 2, height / 2, 100, { isStatic: true, isSensor: true });
        //         Matter.World.add(worldRef.current, explosion);
        //         entitiesRef.current[`explosion_${explosion.id}`] = {
        //             body: explosion,
        //             renderer: Explosion,
        //             timeout: setTimeout(() => delete entitiesRef.current[`explosion_${explosion.id}`], 2000),
        //         };
        //     }
        // } catch (e) {
        //     console.log(e, 'handlemegabomb')
        // }
    };

    const Profiler = (entities, { time }) => {
        const start = performance.now();
        // store start time in global or ref for comparison later
        if (!global.lastFrameStart) {
            global.lastFrameStart = start;
        } else {
            const frameTime = start - global.lastFrameStart;
            console.log(`Frame duration: ${frameTime.toFixed(2)} ms`);
            global.lastFrameStart = start;
        }
        return entities;
    };

    const withProfiler = (system, name) => {
        return (entities, args) => {
            const start = performance.now();
            const result = system(entities, args);
            const end = performance.now();
            const duration = (end - start);
            if (duration > 20) { // log only heavy spikes
                console.warn(`[⚠️ ${name}] took ${duration.toFixed(2)} ms`);
            }
            return result;
        };
    };

    // const systems = [
    //     withProfiler(Physics, "Physics"),
    //     withProfiler(TimerSystem, "TimerSystem"),
    //     withProfiler(MoveShip, "MoveShip"),
    //     withProfiler(CoinAttractionSystem, "CoinAttractionSystem"),
    //     withProfiler(BulletShooter, "BulletShooter"),
    //     withProfiler(AsteroidSpawner, "AsteroidSpawner"),
    //     withProfiler(MoveMega, "MoveMega"),
    //     withProfiler(CoinSpawner, "CoinSpawner"),
    //     withProfiler(MegaBombSpawner, "MegaBombSpawner"),
    //     withProfiler(MultiplierSpawner, "MultiplierSpawner"),
    //     withProfiler(ShieldSpawner, "ShieldSpawner"),
    //     withProfiler(CoinMagnetSpawner, "CoinMagnetSpawner"),
    //     withProfiler(handleCollisions, "handleCollisions"),
    //     withProfiler(CleanupEntities, "CleanupEntities"),
    //     // Profiler,
    // ];

    const systems = [
        Physics,
        TimerSystem,
        MoveShip,
        CoinAttractionSystem,
        BulletShooter,
        AsteroidSpawner,
        MoveMega,
        CoinSpawner,
        MegaBombSpawner,
        MultiplierSpawner,
        ShieldSpawner,
        CoinMagnetSpawner,
        handleCollisions,
        CleanupEntities,
        // Profiler,
    ];

    return (
        <ImageBackground source={require('../assets/imgaes/background3.jpg')} resizeMode="cover" style={styles.containerImg}>
            {gameStart &&
                <GameEngine
                    ref={gameEngine}
                    style={styles.container}
                    systems={systems}
                    entities={entitiesRef.current}
                    running={!gameOver && !gamePause}
                >
                    <StatusBar hidden={true} />
                    <HUD gameState={gameStateRef.current} onUseMegaBomb={() => useMegaBomb()} showBlinkingHeart={showBlinkingHeart} difficulty={progressiveDifficultyRef.current} />
                </GameEngine>}

            <Modal animationType="fade" transparent={true} visible={modalVisible}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>GAME OVER</Text>
                        <TouchableScale style={styles.modalButton} onPress={() => { resetGame(); setModalVisible(false); }}>
                            <Text style={styles.modalButtonText}>Play Again</Text>
                        </TouchableScale>
                        <TouchableScale style={styles.modalButton} onPress={() => navigation.replace('MainMenu')}>
                            <Text style={styles.modalButtonText}>Main Menu</Text>
                        </TouchableScale>
                    </View>
                </View>
            </Modal>

            <Modal animationType="fade" transparent={true} visible={!gameStart || showPauseModal}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {!gameStart ? <Text style={{ ...styles.modalTitle, marginTop: 20 }}>Loading...</Text> : <>
                            <Text style={styles.modalTitle}>GAME PAUSE</Text>
                            <TouchableScale style={styles.modalButton} onPress={() => { setGamePause(false); setShowPauseModal(false);
                                playSound('laser');
                             }}>
                                <Text style={styles.modalButtonText}>Resume</Text>
                            </TouchableScale>
                            <TouchableScale style={styles.modalButton} onPress={() => navigation.replace('MainMenu')}>
                                <Text style={styles.modalButtonText}>Go Back</Text>
                            </TouchableScale></>}
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                visible={levelModalVisible}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackground} activeOpacity={1}>
                        <View style={styles.modalContentLevel}>
                            <Animated.Text
                                style={[
                                    styles.animatedText,
                                    {
                                        transform: [{ scale: scaleAnim }],
                                        opacity: fadeAnim,
                                    },
                                ]}
                            >
                                LEVEL UP!
                            </Animated.Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </ImageBackground>
    );
}