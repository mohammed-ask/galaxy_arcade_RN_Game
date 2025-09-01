import { Dimensions, Image } from 'react-native';
import FastImage from 'react-native-fast-image';

// Screen dimensions
export const { width, height } = Dimensions.get('screen');

// Game entity sizes
export const shipSize = 50;
export const bulletSize = { width: 10, height: 20 };
export const asteroidSize = 40;
export const coinSize = 10;
export const powerUpSize = 20; // Default size for megaBomb, shield, coinMagnet
export const multiplierSize = 30; // Larger for multiplier
export const boomSize = 30;
export const explosionSize = 100;

// Colors for asteroids
export const colors = ['red', 'blue', 'orange'];

// Asteroid image mappings
export const asteroidImages = {
    1: require('../assets/imgaes/asteroid1.png'),
    2: require('../assets/imgaes/asteroid2.png'),
    3: require('../assets/imgaes/asteroid3.png'),
    4: require('../assets/imgaes/asteroid4.png'),
    5: require('../assets/imgaes/asteroid5.png'),
    6: require('../assets/imgaes/asteroid6.png'),
    7: require('../assets/imgaes/asteroid7.png'),
    8: require('../assets/imgaes/asteroid8.png'),
};

export const images = [
    require('../assets/imgaes/asteroid1.png'),
    require('../assets/imgaes/asteroid2.png'),
    require('../assets/imgaes/asteroid3.png'),
    require('../assets/imgaes/asteroid4.png'),
    require('../assets/imgaes/asteroid5.png'),
    require('../assets/imgaes/asteroid6.png'),
    require('../assets/imgaes/asteroid7.png'),
    require('../assets/imgaes/asteroid8.png'),
    require('../assets/imgaes/mega.png'),
    require('../assets/imgaes/heart.png'),
    require('../assets/imgaes/bullet1.png'),
]

export const gifAssets = [
    require('../assets/imgaes/explosion.gif'),
    require('../assets/imgaes/shipshield.gif'),
    require('../assets/imgaes/magnetism.gif'),
    require('../assets/imgaes/star.gif'),
    require('../assets/imgaes/bombstatic.png'),
    require('../assets/imgaes/boom.gif'),
    require('../assets/imgaes/enemyshield.gif'),
    require('../assets/imgaes/goldcoinstatic.png'),
    require('../assets/imgaes/magnet.gif'),
    require('../assets/imgaes/shielded.gif'),
]

export const preloadImages = async () => {
    const promises = images.map(img => Image.prefetch(Image.resolveAssetSource(img).uri));
    await Promise.all(promises);
    console.log("✅ All images preloaded");
};

export const preloadGifs = async () => {
    const promises = gifAssets.map(img =>
        FastImage.preload([{ uri: Image.resolveAssetSource(img).uri }])
    );
    await Promise.all(promises);
    console.log("✅ All GIFs preloaded");
};

export const preloadAssets = async () => {
    try {
        await preloadImages();
        await preloadGifs();
        console.log("🎉 All assets ready before game start!");
    } catch (e) {
        console.warn("Asset preload failed:", e);
    }
};

// Spaceship icons (assuming these are defined in your utils/index.js)
export const spaceShipIcons = [
    { id: 1, source: require('../assets/imgaes/spaceship.png') }, // Placeholder paths
    { id: 2, source: require('../assets/imgaes/spaceship2.png') },
    { id: 3, source: require('../assets/imgaes/spaceship3.png') },
    { id: 3, source: require('../assets/imgaes/spaceship4.png') },
    { id: 3, source: require('../assets/imgaes/spaceship5.png') },
    { id: 3, source: require('../assets/imgaes/spaceship6.png') },
    // Add more as per your game data
];

// Game timing and intervals
export const BULLET_COOLDOWN = 200; // Default bullet firing rate (ms)
export const ASTEROID_SPAWN_COOLDOWN = 500; // Minimum time between asteroid spawns (ms)
export const COIN_SPAWN_COOLDOWN = 1000; // Minimum time between coin spawns (ms)
export const POWER_UP_SPAWN_RATE = 0.001; // Probability per frame for power-ups
export const ENEMY_SPEED_INCREASE_INTERVAL = 30000; // 30 seconds (ms)
export const BOOM_DURATION = 300; // Duration of boom effect (ms)
export const EXPLOSION_DURATION = 2000; // Duration of mega bomb explosion (ms)

// Physics settings
export const FRICTION_AIR = {
    asteroid: 0.1,
    meteor: 0.15,
    mega: 0.6,
    bullet: 0,
    coin: 0.1,
    powerUp: 0.2,
};
export const RESTITUTION = {
    asteroid: 0.5,
    coin: 1,
};

// Game progression thresholds
export const LEVEL_UP_SCORE = 200;
export const LEVEL_3_SCORE = 500;

// Power-up durations (in seconds)
export var SHIELD_DURATION = 10;
export var MAGNET_DURATION = 10;
export var MULTIPLIER_DURATION = 10;

export const updatePowerUp = (powerUps) => {
    SHIELD_DURATION = powerUps[0].duration
    MAGNET_DURATION = powerUps[1].duration
    MULTIPLIER_DURATION = powerUps[2].duration
}

// Scoring
export const SCORES = {
    asteroid: 10,
    meteor: 20,
    mega: 50,
    coin: 1,
};

// Health values
export const HEALTH = {
    asteroid: 1,
    meteor: 4,
    mega: 15,
};

// Coin pattern settings
export const COIN_PATTERN_COUNT = 5; // Number of coins in a pattern
export const COIN_SPACING = 50; // Spacing between coins in a pattern

// Mega movement settings
export const MEGA_AMPLITUDE = 100; // Horizontal movement range
export const MEGA_FREQUENCY = 0.5; // Oscillation speed
export const MEGA_FALL_SPEED = 0.01; // Vertical fall speed

// Coin magnet attraction
export const COIN_MAGNET_RADIUS = 200; // Radius for coin attraction
export const COIN_MAGNET_FORCE = 5; // Speed of attraction