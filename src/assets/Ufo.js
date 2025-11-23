import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { gifAssets } from '../screens/constants';

const Asteroid = ({ body, color, health, enemyGenerate }) => {

  return (
    <>
      {body.label === 'asteroid'
        ?
        <Image
          source={enemyGenerate}
          style={{ ...styles.imgStyle, left: body.position.x - 20, top: body.position.y - 20 }}
        /> :
        body.label === 'meteor' ?
          <Image source={enemyGenerate} style={{ ...styles.imgStyle, left: body.position.x - 20, top: body.position.y - 20 }} />
          : body.label === 'mega' ?
            <Image source={require('../assets/imgaes/mega.png')} style={{ ...styles.imgStyle, width: 60, height: 60, left: body.position.x - 20, top: body.position.y - 20 }} /> :
            <Image source={require('../assets/imgaes/omega.png')} style={{ ...styles.imgStyle, width: 80, height: 80, left: body.position.x - 30, top: body.position.y - 30 }} />
      }
      {body.label === 'meteor' && (
        <View
          style={{
            position: 'absolute',
            left: body.position.x - 15,
            top: body.position.y + 30,
            width: 40,
            height: 3,
            backgroundColor: 'red',
            borderRadius: 6
          }}
        >
          <View
            style={{
              width: (health / 4) * 80,
              height: 3,
              backgroundColor: 'green',
              borderRadius: 6

            }}
          />
          <Text style={{ color: 'white', fontSize: 10, position: 'absolute', right: 0, top: -10, fontFamily: 'Audiowide-Regular' }}>{health}</Text>
        </View>
      )}
      {body.label === 'mega' && (
        <View
          style={{
            position: 'absolute',
            left: body.position.x - 20,
            top: body.position.y + 50,
            width: 60,
            height: 3,
            backgroundColor: 'red',
            borderRadius: 6
          }}
        >
          <View
            style={{
              width: (health / 15) * 60,
              height: 3,
              backgroundColor: 'green',
              borderRadius: 6

            }}
          />
          <Text style={{ color: 'white', fontSize: 10, position: 'absolute', right: 0, top: -10, fontFamily: 'Audiowide-Regular' }}>{health}</Text>
        </View>
      )}
      {body.label === 'boss' && (
        <>
        <View
          style={{
            position: 'absolute',
            left: body.position.x - 30,
            top: body.position.y + 70,
            width: 80,
            height: 3,
            backgroundColor: 'red',
            borderRadius: 6
          }}
        >
          <View
            style={{
              width: (health / 30) * 24,
              height: 3,
              backgroundColor: 'green',
              borderRadius: 6

            }}
          />
          <Text style={{ color: 'white', fontSize: 10, position: 'absolute', right: 0, top: -10, fontFamily: 'Audiowide-Regular' }}>{health}</Text>
          
        </View>
        {body.isShieldActive && (
           <Image source={gifAssets[1]} style={{ width: 150, height: 150, position: 'absolute', left: body.position.x - 60, top: body.position.y - 60 }} resizeMode='contain' /> 
          )}
        </>
      )}
    </>
  );
};

export default Asteroid;
const styles = StyleSheet.create({
  imgStyle: {
    width: 50, height: 50, position: 'absolute',
  }
})