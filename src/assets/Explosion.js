import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Explosion = ({ body }) => {
    return (
        <Image source={require('../assets/imgaes/explosion.gif')} style={{ position: 'absolute', left: body.position.x, top: body.position.y, height: 300, width: 300 }} />
    );
};

export default Explosion;