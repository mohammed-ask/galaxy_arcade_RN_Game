import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Shield = ({ body }) => {
    return (
        <Image source={require('../assets/imgaes/shielded.gif')} style={{ position: 'absolute', left: body.position.x, top: body.position.y, height: 70, width: 70 }} />
    );
};

export default Shield;