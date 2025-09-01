import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { gifAssets } from '../screens/constants';

const Star = ({ body }) => {
    return (
        <Image source={gifAssets[3]} style={{ position: 'absolute', left: body.position.x, top: body.position.y, height: 60, width: 60 }} />
    );
};

export default Star;