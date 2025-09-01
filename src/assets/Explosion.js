import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { gifAssets } from '../screens/constants';

const Explosion = ({ body }) => {
    return (
        <Image source={gifAssets[0]} style={{ position: 'absolute', left: body.position.x, top: body.position.y, height: 300, width: 300 }} />
    );
};

export default Explosion;