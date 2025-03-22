import Matter from 'matter-js';
import { Dimensions } from 'react-native';
import { shipSize } from './constants';

const { width, height } = Dimensions.get('screen');

// Object pools for reusing entities
const bulletPool = [];
const asteroidPool = [];
const coinPool = [];
const POOL_SIZE = 50; // Adjust based on game needs

// Initialize pools
for (let i = 0; i < POOL_SIZE; i++) {
    bulletPool.push(
        Matter.Bodies.rectangle(0, 0, 10, 20, {
            label: 'bullet',
            isSensor: true,
            frictionAir: 0,
            inertia: Infinity,
            isActive: false,
            id: `bullet_${i}_${Date.now()}`, // Unique ID for entity tracking
        })
    );
    asteroidPool.push(
        Matter.Bodies.circle(0, 0, 40, {
            label: 'asteroid',
            restitution: 0.5,
            frictionAir: 0.1,
            health: 1,
            isActive: false,
            id: `asteroid_${i}_${Date.now()}`,
        })
    );
    coinPool.push(
        Matter.Bodies.circle(0, 0, 10, {
            label: 'coin',
            isSensor: true,
            restitution: 1,
            frictionAir: 0.1,
            friction: 0.1,
            isActive: false,
            id: `coin_${i}_${Date.now()}`,
        })
    );
}

// Bullet creation (with pooling)
export const getBulletFromPool = (x, y, isEnemyBullet = false) => {
    const bullet = bulletPool.find(b => !b.isActive);
    if (bullet) {
        bullet.label = isEnemyBullet ? 'enemyBullet' : 'bullet';
        Matter.Body.setPosition(bullet, { x, y });
        Matter.Body.setVelocity(bullet, { x: 0, y: isEnemyBullet ? 3 : -5 });
        if (!isEnemyBullet) {
            Matter.Body.set(bullet, { force: { x: 0, y: -0.03 } });
        }
        bullet.isActive = true;
        return bullet;
    }
    // Fallback: Create a new bullet if pool is exhausted (rare case)
    const newBullet = Matter.Bodies.rectangle(x, y, 10, 20, {
        label: isEnemyBullet ? 'enemyBullet' : 'bullet',
        isSensor: true,
        frictionAir: 0,
        inertia: Infinity,
        id: `bullet_extra_${Date.now()}`,
    });
    Matter.Body.setVelocity(newBullet, { x: 0, y: isEnemyBullet ? 3 : -5 });
    if (!isEnemyBullet) {
        Matter.Body.set(newBullet, { force: { x: 0, y: -0.03 } });
    }
    return newBullet;
};


// Asteroid creation (with pooling)
export const getAsteroidFromPool = (x, y, isMeteor = false, isMega = false) => {
    const asteroid = asteroidPool.find(a => !a.isActive);
    if (asteroid) {
        asteroid.label = isMega ? 'mega' : isMeteor ? 'meteor' : 'asteroid';
        asteroid.frictionAir = isMega ? 0.6 : isMeteor ? 0.15 : 0.1;
        asteroid.health = isMega ? 15 : isMeteor ? 4 : 1;
        Matter.Body.setPosition(asteroid, { x, y });
        Matter.Body.setVelocity(asteroid, { x: 0, y: 5 });
        asteroid.isActive = true;
        return asteroid;
    }
    // Fallback: Create a new asteroid if pool is exhausted
    const newAsteroid = Matter.Bodies.circle(x, y, 40, {
        label: isMega ? 'mega' : isMeteor ? 'meteor' : 'asteroid',
        restitution: 0.5,
        frictionAir: isMega ? 0.6 : isMeteor ? 0.15 : 0.1,
        health: isMega ? 15 : isMeteor ? 4 : 1,
        id: `asteroid_extra_${Date.now()}`,
    });
    Matter.Body.setVelocity(newAsteroid, { x: 0, y: 5 });
    return newAsteroid;
};

// Coin creation (with pooling)
export const getCoinFromPool = (x, y) => {
    const coin = coinPool.find(c => !c.isActive);
    if (coin) {
        Matter.Body.setPosition(coin, { x, y });
        Matter.Body.setVelocity(coin, { x: 0, y: 1 });
        coin.isActive = true;
        return coin;
    }
    // Fallback: Create a new coin if pool is exhausted
    const newCoin = Matter.Bodies.circle(x, y, 10, {
        label: 'coin',
        isSensor: true,
        restitution: 1,
        frictionAir: 0.1,
        friction: 0.1,
        id: `coin_extra_${Date.now()}`,
    });
    Matter.Body.setVelocity(newCoin, { x: 0, y: 1 });
    return newCoin;
};

// Power-up creation (no pooling for simplicity, as they’re rare)
export const createMegaBomb = (x, y) => {
    return Matter.Bodies.circle(x, y, 20, {
        label: 'megaBomb',
        isSensor: true,
        frictionAir: 0.2,
        id: `megaBomb_${Date.now()}`,
    });
};

export const createMultiplier = (x, y) => {
    return Matter.Bodies.circle(x, y, 30, {
        label: 'multiplier',
        isSensor: true,
        frictionAir: 0.2,
        id: `multiplier_${Date.now()}`,
    });
};

export const createShield = (x, y) => {
    return Matter.Bodies.circle(x, y, 20, {
        label: 'shield',
        isSensor: true,
        frictionAir: 0.2,
        id: `shield_${Date.now()}`,
    });
};

export const createCoinMagnet = (x, y) => {
    return Matter.Bodies.circle(x, y, 20, {
        label: 'coinMagnet',
        isSensor: true,
        frictionAir: 0.2,
        id: `coinMagnet_${Date.now()}`,
    });
};

// Ship creation (no pooling, as there’s only one)
export const createShip = () => {
    return Matter.Bodies.rectangle(width / 2, height - shipSize * 2, shipSize, shipSize, {
        isStatic: true,
        id: 'ship',
    });
};

// Boom effect (temporary entity, no pooling)
export const createBoom = (x, y) => {
    return Matter.Bodies.circle(x, y, 30, {
        isStatic: true,
        isSensor: true,
        id: `boom_${Date.now()}`,
    });
};

// Explosion effect for mega bomb (temporary entity, no pooling)
export const createExplosion = (x, y) => {
    return Matter.Bodies.circle(x, y, 100, {
        isStatic: true,
        isSensor: true,
        id: `explosion_${Date.now()}`,
    });
};

// Reset entity to pool (called by CleanupEntities or collision handler)
export const resetEntity = (entity) => {
    if (entity.isActive) {
        Matter.Body.setPosition(entity, { x: 0, y: 0 });
        Matter.Body.setVelocity(entity, { x: 0, y: 0 });
        entity.isActive = false;
    }
};