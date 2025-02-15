import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const Asteroid = ({ body, color, health }) => {
  return (
    <>
      {body.label === 'asteroid' ? <Image source={require('../assets/imgaes/asteroid.png')} style={{ ...styles.imgStyle, left: body.position.x - 20, top: body.position.y - 20 }} /> : <Image source={require('../assets/imgaes/meteor.png')} style={{ ...styles.imgStyle, left: body.position.x - 20, top: body.position.y - 20 }} />
      }
      {body.label === 'meteor' && (
        <View
          style={{
            position: 'absolute',
            left: body.position.x - 20,
            top: body.position.y + 30,
            width: 40,
            height: 5,
            backgroundColor: 'red',
          }}
        >
          <View
            style={{
              width: (health / 4) * 40,
              height: 5,
              backgroundColor: 'green',
            }}
          />
        </View>
      )}
    </>
  );
};

export default Asteroid;
const styles = StyleSheet.create({
  imgStyle: {
    width: 40, height: 40, position: 'absolute',
  }
})