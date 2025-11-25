import AsyncStorage from '@react-native-async-storage/async-storage';

export const spaceShipIcons = [
    {
        id: 1,
        source: require('../assets/imgaes/spaceship.png'),
    },
    {
        id: 2,
        source: require('../assets/imgaes/spaceship2.png'),
    },
    {
        id: 3,
        source: require('../assets/imgaes/spaceship3.png'),
    },
    {
        id: 4,
        source: require('../assets/imgaes/spaceship4.png'),
    },
    {
        id: 5,
        source: require('../assets/imgaes/spaceship5.png'),
    },
    {
        id: 6,
        source: require('../assets/imgaes/spaceship6.png'),
    },
]

export const powerUpIcons = [
    {
        id: 1,
        source: require('../assets/imgaes/shielded.gif'),
    },
    {
        id: 2,
        source: require('../assets/imgaes/magnet.gif'),
    },
    {
        id: 3,
        source: require('../assets/imgaes/star.gif'),
    }
]

export const Color = {
    primaryColor: '#6200EE',
    grayColor: 'gray',
    green: '#00FF00',
    white: '#fff',
    black: '#000'
}

export const isEmpty = value =>
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0);

export const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (e) {
        // saving error
    }
};

export const getData = async key => {
    var data = '';
    try {
        const storageData = await AsyncStorage.getItem(key);
        if (storageData !== null) {
            data = storageData;
        }
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.log('Error on Storage', e)
    }
};