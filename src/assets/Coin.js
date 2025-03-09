import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Coin = ({ body }) => {
    return (
        <Image source={require('../assets/imgaes/goldcoin.gif')} style={{ position: 'absolute', left: body.position.x, top: body.position.y, height: 30, width: 30 }} />
    );
};

export default Coin;