import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Shield = ({ body }) => {
    return (
        <Image source={require('../assets/imgaes/shielded.gif')} style={{ position: 'absolute', left: body.position.x, top: body.position.y, height: 60, width: 60 }} />
    );
};

export default Shield;