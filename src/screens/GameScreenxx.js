import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, StatusBar, Text, View, Alert, ImageBackground, Modal, TouchableOpacity, BackHandler, Image, AppState, Vibration } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';
import Asteroid from '../assets/Ufo.js';
import Bullet from '../assets/Bullets.js';
import Spaceship from '../assets/Spaceship.js';
import Boom from '../assets/Boom.js';
import Coin from '../assets/Coin.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TouchableScale from 'react-native-touchable-scale';
import Sound from 'react-native-sound';
import Life from '../assets/Life.js';
import Bomb from '../assets/Bomb.js';
import Explosion from '../assets/Explosion.js';
import Star from '../assets/Star.js';
import TimerBar from '../components/TimerBar.js';
import styles from './GameStyle.js';
import Shield from '../assets/Shield.js';
import CoinMagnet from '../assets/CoinMagnet.js';
import { getData, isEmpty, spaceShipIcons } from '../utils/index.js';

const { width, height } = Dimensions.get('screen');
const shipSize = 50;
const colors = ['red', 'blue', 'orange'];
var soundEffect = false
var activeShipIconIndex = 0
var shieldTime = 10
var magnetTime = 10
var multiplierTime = 10
var magnetTimeoutId = null
var shieldTimeoutId = null
export default function GameScreen({ navigation }) {
  const entitiesRef = useRef({});
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);
  const [displayCoins, setDisplayCoins] = useState(0); // Coin counter
  const [bulletSpeed, setBulletSpeed] = useState(200); // Coin counter
  const [bulletCombo, setBulletCombo] = useState(2); // Coin counter
  const [gameOver, setGameOver] = useState(false);
  const [gamePause, setGamePause] = useState(false);
  const [levelUp, setLevelUp] = useState(false); // Track level up
  const [level3, setLevel3] = useState(false); // Track level 3
  const [megaSpawned, setMegaSpawned] = useState(false); // Track if mega is spawned
  const gameEngine = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showBlinkingHeart, setShowBlinkingHeart] = useState(false);
  const lastLaserSoundTime = useRef(0); // Track the last time the laser sound was played
  const soundRefs = useRef({
    laser: null,
    pop: null,
    coin: null,
    gameOver: null,
    lifeLost: null,
    explosion: null,
    powercollection: null,
    bossPop: null,
  });
  const [enemySpeedMultiplier, setEnemySpeedMultiplier] = useState(0); // Initial speed multiplier
  const elapsedTimeRef = useRef(0); // Track elapsed time in milliseconds
  function getRandomNumber() {
    return Math.floor(Math.random() * 8) + 1;
  }
  const [displayTime, setDisplayTime] = useState('00:00'); // Formatted time (MM:SS)
  // Add Mega Bomb state
  const [megaBombCount, setMegaBombCount] = useState(0);
  const [multiplierDuration, setMultiplierDuration] = useState(0); // Track remaining duration
  const [multiplierProgress, setMultiplierProgress] = useState(0); // Track progress for the duration bar
  const isMultiplierActiveRef = useRef(false);
  const isShieldActive = useRef(false); // Track if shield is active
  const [shieldDuration, setShieldDuration] = useState(0); // Track remaining duration
  const [shieldProgress, setShieldProgress] = useState(0); // Track progress for the duration bar
  const [coinMagnetDuration, setCoinMagnetDuration] = useState(0);
  const [coinMagnetProgress, setCoinMagnetProgress] = useState(0);
  const isCoinMagnetActive = useRef(false);
  const isPowerUpActive = useRef(false);

  const asteroidImages = {
    1: require('../assets/imgaes/asteroid1.png'),
    2: require('../assets/imgaes/asteroid2.png'),
    3: require('../assets/imgaes/asteroid3.png'),
    4: require('../assets/imgaes/asteroid4.png'),
    5: require('../assets/imgaes/asteroid5.png'),
    6: require('../assets/imgaes/asteroid6.png'),
    7: require('../assets/imgaes/asteroid7.png'),
    8: require('../assets/imgaes/asteroid8.png'),
  };

  const [appState, setAppState] = useState(AppState.currentState);
  const whooshRef = useRef(null);  // Using useRef to persist the sound object

  useEffect(() => {
    // Create the sound object when the component mounts
    whooshRef.current = new Sound('game_music_two.mp3', Sound.MAIN_BUNDLE, async (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      const music = await getData('musicEnabled')

      // Play the sound with an onEnd callback
      if (music) {
        whooshRef.current.setVolume(0.1);
        whooshRef.current.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }
    });


    // Cleanup when the component unmounts
    return () => {
      if (whooshRef.current) {
        whooshRef.current.release();
      }
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App comes back to the foreground, resume sound
        if (whooshRef.current && !whooshRef.current.isPlaying()) {
          const music = await getData('musicEnabled')
          if (music) {
            whooshRef.current.play((success) => {
              if (success) {

              } else {
                console.log('Error resuming sound');
              }
            });
          }
        }
      } else if (nextAppState === 'background') {
        // App goes to the background, pause sound
        if (whooshRef.current && whooshRef.current.isPlaying()) {
          whooshRef.current.pause();
        }
        setGamePause(true)
        updateBestScore(scoreRef.current, coinsRef.current)
        soundRefs.current.laser.stop();
        setShowPauseModal(true)
      }
      setAppState(nextAppState);
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup the event listener on component unmount
    return () => {
      subscription.remove();
    };
  }, [appState]);

  const playLaserSound = async () => {
    const currentTime = Date.now(); // Get the current time
    if (currentTime - lastLaserSoundTime.current < 10000) {
      // If less than 200ms have passed, skip playing the sound
      return;
    }

    // Update the last played time
    lastLaserSoundTime.current = currentTime;

    if (soundEffect && soundRefs.current.laser) {
      soundRefs.current.laser.stop(); // Stop any previous instance
      soundRefs.current.laser.setCurrentTime(0); // Stop any previous instance
      soundRefs.current.laser.play();
    }
  };

  // Game state variables
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const coinsRef = useRef(0); // Track collected coins
  const engineRef = useRef(Matter.Engine.create({
    enableSleeping: false,
    positionIterations: 6, // Increase for better collision accuracy
    velocityIterations: 4,
  }));
  const worldRef = useRef(engineRef.current.world);
  const shipRef = useRef(Matter.Bodies.rectangle(width / 2, height - shipSize * 2, shipSize, shipSize, { isStatic: true }));

  //Update Best Score
  const updateBestScore = async (currentScore, coins) => {
    const bestScore = await AsyncStorage.getItem('bestScore');
    const coinsOld = await AsyncStorage.getItem('Coins');
    if (!bestScore || currentScore > parseInt(bestScore)) {
      await AsyncStorage.setItem('bestScore', currentScore.toString());
      // setUserDetail((prev) => ({ ...prev, bestScore: currentScore.toString() }));
    }
    const totalCoins = Number(coinsOld) + Number(coins)
    await AsyncStorage.setItem('Coins', totalCoins.toString());
  };

  // Initialize Matter.js world
  const initializeWorld = () => {
    Matter.World.add(worldRef.current, shipRef.current);
  };

  const clearEntities = async () => {
    // Clear all bodies from the Matter.js world except the ship
    Matter.World.clear(worldRef.current, false);

    // Re-add the ship to the world
    Matter.World.add(worldRef.current, shipRef.current);

    const gameData = await getData('Store')
    const activeShipIconInd = gameData.Ships.filter(gd => gd.active)[0]
    setDisplayLives(activeShipIconInd.lives)
    setBulletSpeed(activeShipIconInd.bulletSpeed)
    setBulletCombo(activeShipIconInd.bulletCombo)
    livesRef.current = activeShipIconInd.lives
    // Clear all entities from the GameEngine except the ship
    if (gameEngine.current) {
      gameEngine.current.swap({
        physics: { engine: engineRef.current, world: worldRef.current },
        spaceship: { body: shipRef.current, size: [shipSize, shipSize], renderer: Spaceship, isVisible: true, showShield: false, showMagnet: false, activeShipIcon: spaceShipIcons[activeShipIconInd.id - 1]?.source },
      });
    }
  };

  // Reset game state
  const resetGame = () => {
    // Clear all entities
    clearEntities();

    livesRef.current = 3;
    scoreRef.current = 0;
    coinsRef.current = 0; // Reset coin count
    setDisplayLives(3);
    setDisplayScore(0);
    setDisplayCoins(0);
    setGameOver(false);
    setLevelUp(false);
    setLevel3(false);
    setMegaSpawned(false);

    // Reset timer and speed multiplier
    elapsedTimeRef.current = 0;
    setEnemySpeedMultiplier(0);
    setDisplayTime('00:00');

    // Clear the Matter.js world and reinitialize
    Matter.Engine.clear(engineRef.current);
    Matter.World.clear(worldRef.current, false);
    engineRef.current = Matter.Engine.create({
      enableSleeping: false,
      positionIterations: 6, // Increase for better collision accuracy
      velocityIterations: 4,
    });
    worldRef.current = engineRef.current.world;
    shipRef.current = Matter.Bodies.rectangle(width / 2, height - shipSize * 2, shipSize, shipSize, { isStatic: true });
    soundEffect ? soundRefs?.current?.laser?.play() : null;
    initializeWorld();
  };

  useEffect(() => {
    if (showBlinkingHeart) {
      setInterval(() => {
        setShowBlinkingHeart(false)
      }, 600);
    }
  }, [showBlinkingHeart])

  useEffect(() => {
    // Initialize sound effects
    (async () => {
      soundEffect = await getData('soundEnabled')
      // const music = await getData('musicEnabled')
      const gameData = await getData('Store')
      shieldTime = gameData.powerUps[0].duration
      magnetTime = gameData.powerUps[1].duration
      multiplierTime = gameData.powerUps[2].duration

      soundRefs.current.laser = new Sound('laser.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
        } else {
          // Preload the sound
          soundRefs.current.laser.setVolume(0.02);
        }
      });

      soundRefs.current.pop = new Sound('kill.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
        } else {
          // Preload the sound
          soundRefs.current.pop.setVolume(0.05);
        }
      });

      soundRefs.current.bossPop = new Sound('enemybosskill.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
        } else {
          // Preload the sound
          soundRefs.current.bossPop.setVolume(0.1);
        }
      });

      soundRefs.current.explosion = new Sound('explosion.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
        } else {
          // Preload the sound
          soundRefs.current.explosion.setVolume(0.5);
        }
      });

      soundRefs.current.powercollection = new Sound('powercollection.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
        } else {
          // Preload the sound
          soundRefs.current.powercollection.setVolume(0.2);
        }
      });

      soundRefs.current.coin = new Sound('coin.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
        } else {
          // Preload the sound
          soundRefs.current.coin.setVolume(1.0);
        }
      });

      soundRefs.current.gameOver = new Sound('game_over.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
        } else {
          // Preload the sound
          soundRefs.current.gameOver.setVolume(0.2);
        }
      });

      soundRefs.current.lifeLost = new Sound('lifelost.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
        } else {
          // Preload the sound
          soundRefs.current.lifeLost.setVolume(0.1);
        }
      });
    })()


    // Cleanup sounds when the component unmounts
    return () => {
      Object.values(soundRefs.current).forEach(sound => {
        if (sound) {
          sound.release();
        }
      });
    };
  }, []);

  // Reset game when the component mounts
  useEffect(() => {
    resetGame();
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

  // Check for level up
  useEffect(() => {
    if (scoreRef.current >= 200 && !levelUp) {
      setLevelUp(true); // Activate level up
    }
    if (scoreRef.current >= 500 && !level3) {
      setLevel3(true); // Activate level 3
    }
  }, [displayScore, levelUp, level3]);

  // Check for game over
  useEffect(() => {
    if (livesRef.current <= 0 && !gameOver) {
      updateBestScore(scoreRef.current, coinsRef.current)
      setTimeout(() => {
        soundRefs.current.laser.stop();
        setGameOver(true);
      }, 300);
      setModalVisible(true)
      stopGame()
    }
  }, [displayLives, gameOver, navigation]);

  useEffect(() => {
    if (multiplierDuration > 0) {
      const interval = setInterval(() => {
        setMultiplierDuration((prev) => prev - 1); // Decrease duration by 1 second
        setMultiplierProgress((prev) => prev - 10); // Decrease progress bar by 10%
      }, 1000); // Update every second

      return () => { clearInterval(interval) }; // Cleanup interval
    } else if (multiplierDuration === 0) {
      isMultiplierActiveRef.current = false;
      // setIsMultiplierActive(false); // Deactivate multiplier when duration ends
    }
  }, [multiplierDuration]);

  useEffect(() => {
    if (shieldDuration > 0) {
      const interval = setInterval(() => {
        setShieldDuration((prev) => prev - 1); // Decrease duration by 1 second
        setShieldProgress((prev) => prev - 10); // Decrease progress bar by 10%
      }, 1000); // Update every second

      return () => clearInterval(interval); // Cleanup interval
    } else if (shieldDuration === 0) {
      isShieldActive.current = false; // Deactivate shield when duration ends
    }
  }, [shieldDuration]);

  useEffect(() => {
    if (coinMagnetDuration > 0) {
      const interval = setInterval(() => {
        setCoinMagnetDuration((prev) => prev - 1);
        setCoinMagnetProgress((prev) => prev - 10);
      }, 1000);

      return () => clearInterval(interval);
    } else if (coinMagnetDuration === 0) {
      isCoinMagnetActive.current = false;
    }
  }, [coinMagnetDuration]);

  //Pause Game
  const pauseGame = () => {
    setGamePause(true)
    updateBestScore(scoreRef.current, coinsRef.current)
    soundRefs.current.laser.stop();
  }

  // Stop the game
  const stopGame = () => {
    Matter.Engine.clear(engineRef.current); // Stop the physics engine
    Matter.World.clear(worldRef.current, false);
    if (gameEngine.current) {
      gameEngine.current.stop(); // Stop the GameEngine
    }
  };

  // Physics system
  const Physics = (entities, { time }) => {
    Matter.Engine.update(engineRef.current, time.delta);
    // Log entity and physics body counts
    console.log('Physics - Entity count:', Object.keys(entities).length, 'Physics bodies:', Matter.Composite.allBodies(entities.physics.world).length);
    entitiesRef.current = entities; // Update the ref
    return entities;
  };

  const TimerSystem = (entities, { time }) => {
    // const frameRate = Math.round(1000 / time.delta); // Calculate FPS

    // console.log(`Current frame rate: ${frameRate} FPS`);
    elapsedTimeRef.current += time.delta; // Add the time delta to the elapsed time

    // Update the displayed time
    // const totalSeconds = Math.floor(elapsedTimeRef.current / 1000);
    // const minutes = Math.floor(totalSeconds / 60);
    // const seconds = totalSeconds % 60;
    // setDisplayTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

    // Check if 30 seconds have passed
    if (elapsedTimeRef.current >= 30000) {
      elapsedTimeRef.current = 0; // Reset the timer
      if (enemySpeedMultiplier != 0.08) {
        setEnemySpeedMultiplier((prev) => prev + 0.02); // Increase speed by 20%
      }
    }

    return entities;
  };

  const updateScore = (points) => {
    const multiplier = isMultiplierActiveRef.current ? 2 : 1; // Apply multiplier if active
    scoreRef.current += points * multiplier;
    setDisplayScore(scoreRef.current);
  };

  // Ship Movement
  const MoveShip = (entities, { touches }) => {
    touches.forEach(t => {
      if (t.type === 'move' || t.type === 'press') {
        const x = t.event.pageX;
        if (x >= 0 && x <= width) {
          Matter.Body.setPosition(shipRef.current, { x, y: height - shipSize * 2 });
        }
      }
    });
    const shipEntity = entities.spaceship;
    if (shipEntity && shipRef.current) {
      shipEntity.body = shipRef.current;
    }
    return entities;
  };

  const CoinAttractionSystem = (entities, { time }) => {
    if (isCoinMagnetActive.current) {
      const shipPosition = shipRef.current.position;

      Object.keys(entities).forEach(key => {
        const entity = entities[key];
        if (entity.body && entity.body.label === 'coin') {
          const coinPosition = entity.body.position;
          const distance = Matter.Vector.magnitude(Matter.Vector.sub(coinPosition, shipPosition));

          // If the coin is within a certain radius, attract it to the ship
          if (distance < 200) { // Adjust the radius as needed
            const direction = Matter.Vector.sub(shipPosition, coinPosition);
            const force = Matter.Vector.normalise(direction);
            Matter.Body.setVelocity(entity.body, Matter.Vector.mult(force, 5)); // Adjust speed as needed
          }
        }
      });
    }
    return entities;
  };

  const createCoinMagnet = (x, y) => {
    return Matter.Bodies.circle(x, y, 20, {
      label: 'coinMagnet',
      isSensor: true,
      frictionAir: 0.2,
      renderer: CoinMagnet, // You can use a custom renderer for the magnet
    });
  };

  const CoinMagnetSpawner = (entities) => {
    if (!isPowerUpActive.current && Math.random() < 0.001) { // Adjust spawn rate as needed
      const x = Math.random() * (width - 40) + 20;
      const y = 0;
      const coinMagnet = createCoinMagnet(x, y);
      Matter.World.add(worldRef.current, coinMagnet);
      entities[`coinMagnet_${Date.now()}`] = { body: coinMagnet, renderer: CoinMagnet }; // Use a custom renderer
      isPowerUpActive.current = true;
    }
    return entities;
  };

  const createShield = (x, y) => {
    return Matter.Bodies.circle(x, y, 20, {
      label: 'shield',
      frictionAir: 0.2,
      isSensor: true, // Make it a sensor so it doesn't collide physically
      renderer: Coin, // Use a custom renderer for the shield (you can create a new one)
    });
  };

  const ShieldSpawner = (entities) => {
    if (!isPowerUpActive.current && Math.random() < 0.001) { // Only spawn if no power-up is active
      const x = Math.random() * (width - 40) + 20; // Random X position within screen bounds
      const y = 0; // Start at the top of the screen
      const shield = createShield(x, y);
      Matter.World.add(worldRef.current, shield);
      entities[`shield_${Date.now()}`] = { body: shield, renderer: Shield }; // Use a custom renderer
      isPowerUpActive.current = true; // Mark power-up as active
    }
    return entities;
  };

  const createMultiplier = (x, y) => {
    return Matter.Bodies.circle(x, y, 30, {
      label: 'multiplier',
      frictionAir: 0.2,
      isSensor: true, // Make it a sensor so it doesn't collide physically
      renderer: Star, // Use a custom renderer for the multiplier (you can create a new one)
    });
  };

  const MultiplierSpawner = (entities) => {
    if (!isPowerUpActive.current && Math.random() < 0.001) { // Adjust spawn rate as needed
      const x = Math.random() * (width - 40) + 20; // Random X position within screen bounds
      const y = 0; // Start at the top of the screen
      const multiplier = createMultiplier(x, y);
      Matter.World.add(worldRef.current, multiplier);
      entities[`multiplier_${Date.now()}`] = { body: multiplier, renderer: Star }; // Use a custom renderer
      isPowerUpActive.current = true
    }
    return entities;
  };

  // Use Mega Bomb
  const useMegaBomb = () => {
    if (megaBombCount > 0) {
      setMegaBombCount((prev) => prev - 1); // Decrement Mega Bomb count

      // Access entities from the ref
      const entities = entitiesRef.current;

      // Destroy all enemies on the screen
      Object.keys(entities).forEach(key => {
        const entity = entities[key];
        if (entity.body && (entity.body.label === 'asteroid' || entity.body.label === 'meteor' || entity.body.label === 'mega')) {
          Matter.World.remove(worldRef.current, entity.body);
          delete entities[key];

          // Update the score based on the enemy type
          if (entity.body.label === 'asteroid') {
            updateScore(10); // Example: 10 points for an asteroid
          } else if (entity.body.label === 'meteor') {
            updateScore(20); // Example: 20 points for a meteor
          } else if (entity.body.label === 'mega') {
            updateScore(50); // Example: 50 points for a mega enemy
          }
        }
      });

      // Add explosion at the center of the screen
      const explosion = {
        body: Matter.Bodies.circle(width / 9, height / 3, 100, {
          isStatic: true,
          isSensor: true,
        }),
        renderer: Explosion, // Use a custom explosion renderer
        timeout: setTimeout(() => {
          Matter.World.remove(worldRef.current, explosion.body);
          delete entities[`explosion_${explosion.body.id}`];
        }, 2000), // Remove explosion after 300ms
      };
      Matter.World.add(worldRef.current, explosion.body);
      entities[`explosion_${explosion.body.id}`] = explosion;
      Vibration.vibrate(100);
      // Play explosion sound
      if (soundEffect && soundRefs.current.explosion) {
        soundRefs.current.explosion.stop();
        soundRefs.current.explosion.setCurrentTime(0);
        soundRefs.current.explosion.play();
      }
    }
  };

  // Create Mega Bomb entity
  const createMegaBomb = (x, y) => {
    return Matter.Bodies.circle(x, y, 20, {
      label: 'megaBomb',
      isSensor: true,
      frictionAir: 0.2,
      renderer: Bomb, // Use a custom renderer
    });
  };

  // Spawn Mega Bomb
  const MegaBombSpawner = (entities) => {
    if (!isPowerUpActive.current && Math.random() < 0.001) { // Adjust spawn rate as needed
      const x = Math.random() * (width - 40) + 20;
      const y = 0;
      const megaBomb = createMegaBomb(x, y);
      Matter.World.add(worldRef.current, megaBomb);
      entities[`megaBomb_${Date.now()}`] = { body: megaBomb, renderer: Bomb };
      isPowerUpActive.current = true
    }
    return entities;
  };

  // Create a bullet
  const createBullet = (x, y, isEnemyBullet = false) => {
    return Matter.Bodies.rectangle(x, y, 10, 20, {
      label: isEnemyBullet ? 'enemyBullet' : 'bullet',
      isSensor: true,
      frictionAir: 0,
      inertia: Infinity,
    });
  };

  // Bullet Shooting (continuous)
  let bulletCooldown = 0;
  const BulletShooter = (entities, { time }) => {
    bulletCooldown += time.delta;
    if (bulletCooldown > bulletSpeed) {
      bulletCooldown = 0;

      // Play laser sound (debounced)
      playLaserSound();

      // Fire two bullets together if level up is active
      if (levelUp) {
        const bullet1 = createBullet(shipRef.current.position.x - 5, shipRef.current.position.y - 30);
        const bullet2 = createBullet(shipRef.current.position.x + 5, shipRef.current.position.y - 30);
        Matter.Body.setVelocity(bullet1, { x: 0, y: -5 });
        Matter.Body.setVelocity(bullet2, { x: 0, y: -5 });
        Matter.Body.set(bullet1, { force: { x: 0, y: -0.03 } });
        Matter.Body.set(bullet2, { force: { x: 0, y: -0.03 } });
        Matter.World.add(worldRef.current, bullet1);
        Matter.World.add(worldRef.current, bullet2);
        entities[`bullet_${Date.now()}_1`] = { body: bullet1, color: 'yellow', renderer: Bullet };
        entities[`bullet_${Date.now()}_2`] = { body: bullet2, color: 'yellow', renderer: Bullet };
      } else {
        // Fire single bullet
        const bullet = createBullet(shipRef.current.position.x + 3, shipRef.current.position.y - 30);
        Matter.Body.setVelocity(bullet, { x: 0, y: -5 });
        Matter.Body.set(bullet, { force: { x: 0, y: -0.03 } });
        Matter.World.add(worldRef.current, bullet);
        entities[`bullet_${Date.now()}`] = { body: bullet, color: 'yellow', renderer: Bullet };
      }
    }
    return entities;
  };

  // Generate even or odd
  const generateEvenOdd = () => {
    const num = Math.floor(Math.random() * 10) + 1;
    return num % 2 === 0;
  };

  // Create an asteroid or meteor
  const createAsteroid = (x, y, isMeteor = false, isMega = false) => {
    return Matter.Bodies.circle(x, y, 40, {
      label: isMega ? 'mega' : isMeteor ? 'meteor' : 'asteroid',
      restitution: 0.5,
      frictionAir: isMega ? 0.6 : isMeteor ? 0.15 - Number(enemySpeedMultiplier) : 0.1 - Number(enemySpeedMultiplier),
      health: isMega ? 15 : isMeteor ? 4 : 1,
    });
  };

  // Create 10 asteroids when mega is destroyed
  const spawnAsteroids = (x, y, entities) => {
    for (let i = 0; i < 4; i++) {
      const asteroid = createAsteroid(x, y);
      Matter.Body.setVelocity(asteroid, { x: (Math.random() - 0.5) * 2, y: 5 });
      Matter.World.add(worldRef.current, asteroid);
      entities[`asteroid_${Date.now()}_${i}`] = { body: asteroid, color: colors[Math.floor(Math.random() * colors.length)], renderer: Asteroid, health: 1, enemyGenerate: asteroidImages[getRandomNumber()] };
    }
  };

  // Mega enemy shooting bullets
  const megaShoot = (mega, entities) => {
    const bullet = createBullet(mega.position.x + 15, mega.position.y + 30, true);
    Matter.Body.setVelocity(bullet, { x: 0, y: 3 }); // Bullet speed
    Matter.World.add(worldRef.current, bullet);
    entities[`enemyBullet_${Date.now()}`] = { body: bullet, color: 'red', renderer: Bullet };
  };

  // Move mega with sinusoidal pattern
  const moveMega = (entities, { time }) => {
    Object.keys(entities).forEach((key) => {
      const entity = entities[key];
      if (entity?.body?.label === 'mega') {
        const t = time.current / 1000;
        const amplitude = 100; // Horizontal movement range
        const frequency = 0.5; // Oscillation speed
        const x = entity.body.position.x + Math.sin(t * frequency) * amplitude * 0.05;

        // Keep the mega within screen bounds
        const clampedX = Math.max(30, Math.min(width - 30, x));

        // Apply slower vertical movement
        const fallSpeed = 0.01; // Reduce for slower falling
        Matter.Body.setPosition(entity.body, {
          x: clampedX,
          y: entity.body.position.y + fallSpeed,
        });
      }
    });
    return entities;
  };

  // Asteroid Spawner
  const AsteroidSpawner = (entities, { time }) => {
    const isMeteor = levelUp && generateEvenOdd();

    // Spawn mega only once when level 3 is active
    if (level3 && !megaSpawned) {
      const x = Math.random() * (width - 80) + 40;
      const mega = createAsteroid(x, 0, false, true);
      Matter.Body.setVelocity(mega, { x: (Math.random() - 0.5) * 2, y: 2 }); // Random X movement, slow Y movement
      Matter.World.add(worldRef.current, mega);
      entities[`mega_${Date.now()}`] = { body: mega, color: 'purple', renderer: Asteroid, health: 20 };
      setMegaSpawned(true); // Mark mega as spawned
    }



    if (Math.random() < 0.015) {
      const x = Math.random() * (width - 80) + 40;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const asteroid = createAsteroid(x, 0, isMeteor);
      Matter.Body.setVelocity(asteroid, { x: 0, y: 5 });
      Matter.World.add(worldRef.current, asteroid);
      const key = isMeteor ? `meteor_${Date.now()}` : `asteroid_${Date.now()}`;
      entities[key] = { body: asteroid, color, renderer: Asteroid, health: asteroid.health, enemyGenerate: asteroidImages[getRandomNumber()] };
    }

    // Mega shooting logic
    Object.keys(entities).forEach(key => {
      const entity = entities[key];
      if (entity?.body?.label === 'mega' && Math.random() < 0.01) {
        megaShoot(entity.body, entities);
      }
    });

    return entities;
  };

  // Coin Spawner
  const CoinSpawner = (entities) => {
    if (Math.random() < 0.002) {
      const pattern = Math.floor(Math.random() * 3); // Randomly select a pattern (0, 1, or 2)
      const numCoins = 5; // Number of coins in a pattern
      const spacing = 50; // Spacing between coins

      let x, y, dx, dy;

      switch (pattern) {
        case 0: // Straight vertical
          x = Math.random() * (width - 20) + 10; // Random X position within screen bounds
          y = 0; // Start at the top of the screen
          dx = 0; // No horizontal movement
          dy = spacing; // Vertical spacing
          break;

        case 1: // Diagonal left to right
          x = Math.random() * (width - 20 * numCoins) + 10; // Random X position within screen bounds
          y = 0; // Start at the top of the screen
          dx = spacing; // Move right
          dy = spacing; // Move down
          break;

        case 2: // Diagonal right to left
          x = Math.random() * (width - 20 * numCoins) + 10 + 20 * numCoins; // Random X position within screen bounds
          y = 0; // Start at the top of the screen
          dx = -spacing; // Move left
          dy = spacing; // Move down
          break;

        default:
          break;
      }

      for (let i = 0; i < numCoins; i++) {
        const coin = Matter.Bodies.circle(x + i * dx, y + i * dy, 10, {
          label: 'coin',
          isSensor: true,
          restitution: 1,
          frictionAir: 0.1,
          friction: 0.1,
        });
        Matter.Body.setVelocity(coin, { x: 0, y: 1 }); // Move coins downward
        Matter.World.add(worldRef.current, coin);
        entities[`coin_${Date.now()}_${i}`] = { body: coin, renderer: Coin };
      }
    }
    return entities;
  };

  // Handle collision between bullet and asteroid/meteor/mega
  const handleBulletCollision = (entities, bullet, target, targetKey) => {
    // Remove bullet from Matter.js world and entities
    Matter.World.remove(worldRef.current, bullet);
    Object.keys(entities).forEach(key => {
      if (entities[key].body === bullet) {
        delete entities[key];
      }
    });

    // Decrease target health
    entities[targetKey].health -= 1;

    // If target health reaches 0, remove it
    if (entities[targetKey].health <= 0) {
      Matter.World.remove(worldRef.current, target);
      delete entities[targetKey];

      if (target.label === 'asteroid') {
        // Play pop sound immediately
        if (soundEffect && soundRefs.current.pop) {
          soundRefs.current.pop.stop(); // Stop any previous instance
          soundRefs.current.pop.setCurrentTime(0); // Stop any previous instance
          soundRefs.current.pop.play();
        }
      } else {
        if (soundEffect && soundRefs.current.bossPop) {
          soundRefs.current.bossPop.stop(); // Stop any previous instance
          soundRefs.current.bossPop.setCurrentTime(0); // Stop any previous instance
          soundRefs.current.bossPop.play();
        }
      }

      // Add boom effect at the collision point
      const boom = {
        body: Matter.Bodies.circle(target.position.x, target.position.y, 30, {
          isStatic: true,
          isSensor: true,
        }),
        renderer: Boom,
        timeout: setTimeout(() => {
          Matter.World.remove(worldRef.current, boom.body);
          delete entities[`boom_${boom.body.id}`];
        }, 300), // Remove boom after 300ms
      };
      Matter.World.add(worldRef.current, boom.body);
      entities[`boom_${boom.body.id}`] = boom;

      // Update score
      // Update the score based on the enemy type
      if (target.label === 'asteroid') {
        updateScore(10); // Example: 10 points for an asteroid
      } else if (target.label === 'meteor') {
        updateScore(20); // Example: 20 points for a meteor
      } else if (target.label === 'mega') {
        updateScore(50); // Example: 50 points for a mega enemy
      }

      // If mega is destroyed, spawn 10 asteroids
      if (target.label === 'mega') {
        spawnAsteroids(target.position.x, target.position.y, entities);
        setMegaSpawned(false); // Reset mega spawn flag
      }
    }
  };

  // Collision Handling
  const handleCollisions = (entities) => {
    Matter.Events.on(engineRef.current, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const bodies = [pair.bodyA, pair.bodyB];

        const bullet = bodies.find(b => b.label === 'bullet');
        const enemyBullet = bodies.find(b => b.label === 'enemyBullet');
        const asteroid = bodies.find(b => b.label === 'asteroid');
        const meteor = bodies.find(b => b.label === 'meteor');
        const mega = bodies.find(b => b.label === 'mega');
        const coin = bodies.find(b => b.label === 'coin');
        const shipBody = bodies.find(b => b === shipRef.current);
        const megaBomb = bodies.find(b => b.label === 'megaBomb');
        const multiplier = bodies.find(b => b.label === 'multiplier');
        const shield = bodies.find(b => b.label === 'shield');
        const coinMagnet = bodies.find(b => b.label === 'coinMagnet');

        // Handle bullet-asteroid collision
        if (bullet && (asteroid || meteor || mega) && !pair.isProcessed) {
          // Mark the collision pair as processed
          pair.isProcessed = true;

          const target = asteroid || meteor || mega;
          const targetKey = Object.keys(entities).find(key => entities[key].body === target);
          if (targetKey) {
            handleBulletCollision(entities, bullet, target, targetKey);
          }
        }

        // Handle ship-coin collision
        if (shipBody && coin && !pair.isProcessed) {
          // Mark the collision pair as processed
          pair.isProcessed = true;

          // Remove coin from Matter.js world and entities
          Matter.World.remove(worldRef.current, coin);
          Object.keys(entities).forEach(key => {
            if (entities[key].body === coin) {
              delete entities[key];
            }
          });

          // Play coin sound immediately
          if (soundEffect && soundRefs.current.coin) {
            soundRefs.current.coin.stop(); // Stop any previous instance
            soundRefs.current.coin.setCurrentTime(0); // Stop any previous instance
            soundRefs.current.coin.play();
          }

          // Increment coin count
          coinsRef.current += 1;
          setDisplayCoins(coinsRef.current);
        }

        if (shipBody && megaBomb && !pair.isProcessed) {
          pair.isProcessed = true;

          Matter.World.remove(worldRef.current, megaBomb);
          Object.keys(entities).forEach(key => {
            if (entities[key].body === megaBomb) {
              delete entities[key];
            }
          });

          // Play powercollection sound
          if (soundEffect && soundRefs.current.powercollection) {
            soundRefs.current.powercollection.stop();
            soundRefs.current.powercollection.setCurrentTime(0);
            soundRefs.current.powercollection.play();
          }
          setMegaBombCount((prev) => prev + 1);
          isPowerUpActive.current = false
        }

        // Handle ship-multiplier collision
        if (shipBody && multiplier && !pair.isProcessed) {
          pair.isProcessed = true;

          // Remove multiplier from the world and entities
          Matter.World.remove(worldRef.current, multiplier);
          Object.keys(entities).forEach(key => {
            if (entities[key].body === multiplier) {
              delete entities[key];
            }
          });

          // Play powercollection sound
          if (soundEffect && soundRefs.current.powercollection) {
            soundRefs.current.powercollection.stop();
            soundRefs.current.powercollection.setCurrentTime(0);
            soundRefs.current.powercollection.play();
          }

          // Activate the multiplier
          isMultiplierActiveRef.current = true;
          // setIsMultiplierActive(true);
          setMultiplierDuration(multiplierTime); // Set duration to 10 seconds
          setMultiplierProgress(multiplierTime * 10); // Set progress bar to 100%
          isPowerUpActive.current = false
        }

        // Handle ship-shield collision
        if (shipBody && shield && !pair.isProcessed) {
          pair.isProcessed = true;

          // Remove shield from the world and entities
          Matter.World.remove(worldRef.current, shield);
          Object.keys(entities).forEach(key => {
            if (entities[key].body === shield) {
              delete entities[key];
            }
          });
          const shipEntity = entities.spaceship;

          //Trigger Show Shield
          if (shipEntity && shipRef.current) {
            shipEntity.showShield = true;
          }
          if (!isEmpty(shieldTimeoutId)) {
            clearInterval(shieldTimeoutId)
          }
          shieldTimeoutId = setTimeout(() => {
            const shipEntity = entities.spaceship;
            if (shipEntity && shipRef.current) {
              shipEntity.showShield = false;
            }
          }, shieldTime * 1000); // 500ms blink

          // Play powercollection sound
          if (soundEffect && soundRefs.current.powercollection) {
            soundRefs.current.powercollection.stop();
            soundRefs.current.powercollection.setCurrentTime(0);
            soundRefs.current.powercollection.play();
          }

          // Activate the shield
          isShieldActive.current = true;
          setShieldDuration(shieldTime); // Set duration to 10 seconds
          setShieldProgress(shieldTime * 10); // Set progress bar to 100%
          isPowerUpActive.current = false; // Reset power-up state
        }

        if (shipBody && coinMagnet && !pair.isProcessed) {
          pair.isProcessed = true;

          // Remove coin magnet from the world and entities
          Matter.World.remove(worldRef.current, coinMagnet);
          Object.keys(entities).forEach(key => {
            if (entities[key].body === coinMagnet) {
              delete entities[key];
            }
          });
          const shipEntity = entities.spaceship;

          //Trigger Show Magnet
          if (shipEntity && shipRef.current) {
            shipEntity.showMagnet = true;
          }
          if (!isEmpty(magnetTimeoutId)) {
            clearInterval(magnetTimeoutId)
          }
          magnetTimeoutId = setTimeout(() => {
            const shipEntity = entities.spaceship;
            if (shipEntity && shipRef.current) {
              shipEntity.showMagnet = false;
            }
          }, magnetTime * 1000); // 500ms blink

          // Play powercollection sound
          if (soundEffect && soundRefs.current.powercollection) {
            soundRefs.current.powercollection.stop();
            soundRefs.current.powercollection.setCurrentTime(0);
            soundRefs.current.powercollection.play();
          }

          // Activate the coin magnet
          isCoinMagnetActive.current = true;
          setCoinMagnetDuration(magnetTime); // Set duration to 10 seconds
          setCoinMagnetProgress(magnetTime * 10); // Set progress bar to 100%
          isPowerUpActive.current = false;
        }

        if (enemyBullet && bodies.includes(shipRef.current) && !pair.isProcessed) {
          // Mark the collision pair as processed
          pair.isProcessed = true;

          // Remove enemy bullet from Matter.js world and entities
          Matter.World.remove(worldRef.current, enemyBullet);
          Object.keys(entities).forEach(key => {
            if (entities[key].body === enemyBullet) {
              delete entities[key];
            }
          });

          // Decrease lives
          if (!isShieldActive.current) {
            livesRef.current -= 1;
            setDisplayLives(livesRef.current);
            setShowBlinkingHeart(true)
            if (livesRef.current) {
              // Play lifeLost sound immediately
              if (soundEffect && soundRefs.current.lifeLost) {
                soundRefs.current.lifeLost.stop(); // Stop any previous instance
                soundRefs.current.lifeLost.setCurrentTime(0); // Stop any previous instance
                soundRefs.current.lifeLost.play();
              }
            } else {
              if (soundEffect && soundRefs.current.gameOver) {
                soundRefs.current.gameOver.stop(); // Stop any previous instance
                soundRefs.current.gameOver.setCurrentTime(0); // Stop any previous instance
                soundRefs.current.gameOver.play();
              }
            }
          }

        }

        if (bodies.includes(shipRef.current) && (asteroid || meteor || mega) && !pair.isProcessed) {
          // Mark the collision pair as processed
          pair.isProcessed = true;

          // If mega collides with spaceship, game over instantly
          if (mega) {
            livesRef.current = 0;
            setDisplayLives(0);
            // Play gameOver sound immediately
            if (soundEffect && soundRefs.current.gameOver) {
              soundRefs.current.gameOver.stop(); // Stop any previous instance
              soundRefs.current.gameOver.setCurrentTime(0); // Stop any previous instance
              soundRefs.current.gameOver.play();
            }
          } else {
            // Remove asteroid/meteor from Matter.js world and entities
            const target = asteroid || meteor;
            Matter.World.remove(worldRef.current, target);
            Object.keys(entities).forEach(key => {
              if (entities[key].body === target) {
                delete entities[key];
              }
            });

            // Add boom effect at the collision point
            const boom = {
              body: Matter.Bodies.circle(target.position.x, target.position.y, 30, {
                isStatic: true,
                isSensor: true,
              }),
              renderer: Boom,
              timeout: setTimeout(() => {
                Matter.World.remove(worldRef.current, boom.body);
                delete entities[`boom_${boom.body.id}`];
              }, 300), // Remove boom after 300ms
            };
            Matter.World.add(worldRef.current, boom.body);
            entities[`boom_${boom.body.id}`] = boom;

            // Trigger blinking effect
            const shipEntity = entities.spaceship;
            if (shipEntity && shipRef.current) {
              shipEntity.isVisible = false;
            }
            // setIsBlinking(true);
            setTimeout(() => {
              const shipEntity = entities.spaceship;
              if (shipEntity && shipRef.current) {
                shipEntity.isVisible = true;
              }
            }, 500); // 500ms blink

            // Decrease lives
            if (!isShieldActive.current) {
              livesRef.current -= 1;
              setDisplayLives(livesRef.current);
              setShowBlinkingHeart(true)
              if (livesRef.current) {
                // Play lifeLost sound immediately
                if (soundEffect && soundRefs.current.lifeLost) {
                  soundRefs.current.lifeLost.stop(); // Stop any previous instance
                  soundRefs.current.lifeLost.setCurrentTime(0); // Stop any previous instance
                  soundRefs.current.lifeLost.play();
                }
              } else {
                if (soundEffect && soundRefs.current.gameOver) {
                  soundRefs.current.gameOver.stop(); // Stop any previous instance
                  soundRefs.current.gameOver.setCurrentTime(0); // Stop any previous instance
                  soundRefs.current.gameOver.play();
                }
              }
            } else {
              if (soundEffect && soundRefs.current.pop) {
                soundRefs.current.pop.stop(); // Stop any previous instance
                soundRefs.current.pop.setCurrentTime(0); // Stop any previous instance
                soundRefs.current.pop.play();
              }
            }

          }
        }
      });
    });

    return entities;
  };

  // Cleanup System
  const CleanupEntities = (entities) => {
    Object.keys(entities).forEach(key => {
      const entity = entities[key];
      if (entity.body && (entity.body.position.y < -50 || entity.body.position.y > height + 50)) {
        console.log(worldRef.current, 'world')
        Matter.World.remove(worldRef.current, entity.body);
        delete entities[key];
        // Reset power-up state if a power-up falls off the screen
        if (entity.body.label === 'megaBomb' || entity.body.label === 'multiplier' || entity.body.label === 'shield' || entity.body.label === 'coinMagnet') {
          isPowerUpActive.current = false
        }
      }
    });
    return entities;
  };

  return (
    <ImageBackground source={require('../assets/imgaes/background2.jpg')} resizeMode='cover' style={styles.containerImg}>
      <GameEngine
        ref={gameEngine}
        style={styles.container}
        systems={[Physics, MoveShip, BulletShooter, AsteroidSpawner, CoinSpawner, MegaBombSpawner, MultiplierSpawner, ShieldSpawner, CoinMagnetSpawner, CoinAttractionSystem, handleCollisions, CleanupEntities, moveMega, TimerSystem]}
        entities={{
          physics: { engine: engineRef.current, world: worldRef.current },
          spaceship: { body: shipRef.current, size: [shipSize, shipSize], renderer: Spaceship, isVisible: true, showShield: false, showMagnet: false, activeShipIcon: spaceShipIcons[activeShipIconIndex]?.source },
        }}
        running={!gameOver && !gamePause} // Stop the game loop when game is over
      >
        <StatusBar hidden={true} />
        <Text style={styles.score}>Score: {displayScore}{isMultiplierActiveRef.current ? 'x2' : ''}</Text>
        <View style={{ ...styles.lives, flexDirection: 'row' }}>
          {/* {displayLives.map(item=>)} */}
          {Array(displayLives).fill().map((_, i) => <Life isVisible={true} />)}
          {showBlinkingHeart ?
            <Life isVisible={false} /> : null}
        </View>
        {/* <Text style={styles.timer}>Time: {displayTime}</Text> */}
        <View style={styles.coinContainer}>
          <Image source={require('../assets/imgaes/goldcoin.gif')} style={styles.coin} />
          <Text style={{ color: '#fff', fontFamily: 'Audiowide-Regular' }}>{displayCoins}</Text>
        </View>
        <TouchableOpacity onPress={() => useMegaBomb()} style={styles.megaBombContainer}>
          <Image source={require('../assets/imgaes/bomb.gif')} style={styles.megaBombIcon} />
          <Text style={styles.megaBombCount}>{megaBombCount}</Text>
        </TouchableOpacity>
        <TimerBar multiplierProgress={multiplierProgress} isMultiplierActive={isMultiplierActiveRef.current} range={multiplierTime * 10} />
        <TimerBar multiplierProgress={shieldProgress} isMultiplierActive={isShieldActive.current} range={shieldTime * 10} />
        <TimerBar multiplierProgress={coinMagnetProgress} isMultiplierActive={isCoinMagnetActive.current} range={magnetTime * 10} />
      </GameEngine>
      {/* Modal for User Name Input */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent]}>
            <Text style={styles.modalTitle}>GAME OVER</Text>

            <TouchableScale style={styles.modalButton} onPress={() => { resetGame(); setModalVisible(false) }}>
              <Text style={styles.modalButtonText}>Play Again</Text>
            </TouchableScale>
            <TouchableScale onPress={() => navigation.replace('MainMenu')} style={styles.modalButton} >
              <Text style={styles.modalButtonText}>Main Menu</Text>
            </TouchableScale>
          </View>
        </View>
      </Modal>
      <Modal animationType="fade" transparent={true} visible={showPauseModal}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent]}>
            <Text style={styles.modalTitle}>GAME PAUSE</Text>

            <TouchableScale style={styles.modalButton} onPress={() => { setGamePause(false), setShowPauseModal(false), soundRefs?.current?.laser?.play(); }}>
              <Text style={styles.modalButtonText}>Resume</Text>
            </TouchableScale>
            <TouchableScale onPress={() => navigation.replace('MainMenu')} style={styles.modalButton} >
              <Text style={styles.modalButtonText}>Go Back</Text>
            </TouchableScale>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
