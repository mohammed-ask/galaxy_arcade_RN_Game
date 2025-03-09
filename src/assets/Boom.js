import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Boom = ({ body }) => {
    return (
        <Image source={require('../assets/imgaes/boom.gif')} style={{ position: 'absolute', left: body.position.x - 30, top: body.position.y - 30, height: 80, width: 80 }} />
    );
};

export default Boom;