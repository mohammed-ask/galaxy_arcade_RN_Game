import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Star = ({ body }) => {
    return (
        <Image source={require('../assets/imgaes/star.gif')} style={{ position: 'absolute', left: body.position.x, top: body.position.y, height: 60, width: 60 }} />
    );
};

export default Star;