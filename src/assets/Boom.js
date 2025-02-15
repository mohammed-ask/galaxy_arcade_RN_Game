import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Boom = ({ body }) => {
    return (
        <Image source={require('../assets/imgaes/boom.png')} style={{ position: 'absolute', left: body.position.x - 30, top: body.position.y - 30, height: 60, width: 60 }} />
    );
};

export default Boom;