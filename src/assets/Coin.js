import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Coin = ({ body }) => {
    return (
        <Image source={require('../assets/imgaes/goldcoin.gif')} style={{ position: 'absolute', left: body.position.x - 30, top: body.position.y - 30, height: 30, width: 30 }} />
    );
};

export default Coin;