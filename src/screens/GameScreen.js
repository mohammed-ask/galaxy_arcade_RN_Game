import React, { useRef, useEffect, useState } from 'react';
import { View, Modal, Text, ImageBackground, StatusBar, AppState, BackHandler } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TouchableScale from 'react-native-touchable-scale';
import Sound from 'react-native-sound';
import {
    Physics, MoveShip, BulletShooter, AsteroidSpawner, CoinSpawner, MegaBombSpawner,
    MultiplierSpawner, ShieldSpawner, CoinMagnetSpawner, CoinAttractionSystem,
    handleCollisions, CleanupEntities, MoveMega, TimerSystem, initializeSystems
} from './systems';
import { createShip } from './entities';
import { shipSize, spaceShipIcons, SHIELD_DURATION, MAGNET_DURATION, MULTIPLIER_DURATION } from './constants';
import { initializeSounds, cleanupSounds, getData, updateBestScore } from './utils';
import HUD from './HUD';
import Spaceship from '../assets/Spaceship';
import styles from './GameStyle';

export default function GameScreen({ navigation }) {
    const gameEngine = useRef(null);
    const engineRef = useRef(Matter.Engine.create({ enableSleeping: true }));
    const worldRef = useRef(engineRef.current.world);
    const shipRef = useRef(createShip());
    const entitiesRef = useRef({});
    const whooshRef = useRef(null);

    // Game state
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
        bulletSpeed: 200,
        bulletCombo: 2,
    });

    const [gameOver, setGameOver] = useState(false);
    const [gamePause, setGamePause] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);

    // Initialize game
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
            initializeSounds();
            await resetGame();
            initializeSystems(entitiesRef, gameStateRef, shipRef);
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

    // Handle app state changes (background/foreground)
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
        console.log('hyyy')
        Matter.Engine.clear(engineRef.current); // Stop the physics engine
        Matter.World.clear(worldRef.current, false);
        if (gameEngine.current) {
            gameEngine.current.stop(); // Stop the GameEngine
        }
    };

    // Reset game state
    const resetGame = async () => {
        Matter.World.clear(worldRef.current, false);
        Matter.World.add(worldRef.current, shipRef.current);

        const gameData = await getData('Store');
        const activeShip = gameData?.Ships?.find(ship => ship.active) || { lives: 3, bulletSpeed: 200, bulletCombo: 2, id: 1 };
        const powerUps = gameData?.powerUps || [
            { duration: SHIELD_DURATION },
            { duration: MAGNET_DURATION },
            { duration: MULTIPLIER_DURATION },
        ];

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
            bulletSpeed: activeShip.bulletSpeed,
            bulletCombo: activeShip.bulletCombo,
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

        gameEngine.current?.swap(entitiesRef.current);
    };

    // Game over and level progression
    useEffect(() => {
        if (gameStateRef.current.lives <= 0 && !gameOver) {
            updateBestScore(gameStateRef.current.score, gameStateRef.current.coins);
            setTimeout(() => {
                setGameOver(true);
                setModalVisible(true);
            }, 300);
        }
        if (gameStateRef.current.score >= 200 && !gameStateRef.current.levelUp) {
            gameStateRef.current.levelUp = true;
        }
        if (gameStateRef.current.score >= 500 && !gameStateRef.current.level3) {
            gameStateRef.current.level3 = true;
        }
    }, [gameStateRef.current.lives, gameStateRef.current.score]);

    // Power-up duration timers
    useEffect(() => {
        const intervals = [];
        if (gameStateRef.current.shieldDuration > 0) {
            intervals.push(setInterval(() => {
                gameStateRef.current.shieldDuration -= 1;
                if (gameStateRef.current.shieldDuration <= 0) {
                    gameStateRef.current.isShieldActive = false;
                }
            }, 1000));
        }
        if (gameStateRef.current.coinMagnetDuration > 0) {
            intervals.push(setInterval(() => {
                gameStateRef.current.coinMagnetDuration -= 1;
                if (gameStateRef.current.coinMagnetDuration <= 0) {
                    gameStateRef.current.isCoinMagnetActive = false;
                }
            }, 1000));
        }
        if (gameStateRef.current.multiplierDuration > 0) {
            intervals.push(setInterval(() => {
                gameStateRef.current.multiplierDuration -= 1;
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

    // In GameScreen.js
    const handleMegaBomb = () => {
        if (gameStateRef.current.megaBombCount > 0) {
            gameStateRef.current.megaBombCount -= 1;
            entitiesRef.current = useMegaBomb(entitiesRef.current); // Import from systems.js
        }
    };

    // Pause game
    const pauseGame = () => {
        setGamePause(true);
        updateBestScore(gameStateRef.current.score, gameStateRef.current.coins);
        setShowPauseModal(true);
    };

    // Systems array
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
    ];

    return (
        <ImageBackground source={require('../assets/imgaes/background2.jpg')} resizeMode="cover" style={styles.containerImg}>
            <GameEngine
                ref={gameEngine}
                style={styles.container}
                systems={systems}
                entities={entitiesRef.current}
                running={!gameOver && !gamePause}
            >
                <StatusBar hidden={true} />
                <HUD gameState={gameStateRef.current} onUseMegaBomb={handleMegaBomb} />
            </GameEngine>

            {/* Game Over Modal */}
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

            {/* Pause Modal */}
            <Modal animationType="fade" transparent={true} visible={showPauseModal}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>GAME PAUSE</Text>
                        <TouchableScale style={styles.modalButton} onPress={() => { setGamePause(false); setShowPauseModal(false); }}>
                            <Text style={styles.modalButtonText}>Resume</Text>
                        </TouchableScale>
                        <TouchableScale style={styles.modalButton} onPress={() => navigation.replace('MainMenu')}>
                            <Text style={styles.modalButtonText}>Go Back</Text>
                        </TouchableScale>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}