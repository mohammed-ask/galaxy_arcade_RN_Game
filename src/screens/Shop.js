import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Color, spaceShipIcons } from '../utils';
import { BlurView } from '@react-native-community/blur';

const Shop = () => {
    const [shipData, setShipData] = useState([])
    const [userDetail, setUserDetail] = useState({ userName: '', bestScore: '', Coins: '' });

    useEffect(() => {
        const checkUserDetails = async () => {
            const userName = await AsyncStorage.getItem('userName');
            const bestScore = await AsyncStorage.getItem('bestScore');
            const coins = await AsyncStorage.getItem('Coins');

            setUserDetail({
                userName: userName || '',
                bestScore: bestScore || '0',
                Coins: coins || '0'
            });
        };
        checkUserDetails();

    }, []);

    useEffect(() => {
        (async () => {
            const getShips = await AsyncStorage.getItem('Store')
            setShipData(JSON.parse(getShips))
            // console.log(getShips, 'gss')
        })()
    }, [])

    const ShipCard = ({ ship, index }) => {
        const { name, unlock, cost, active } = ship;

        return (
            <View style={styles.card}>
                {/* Image */}
                <Image source={spaceShipIcons[index].source} style={styles.image} />

                {/* Ship Name */}
                <Text style={styles.name}>{name}</Text>

                {/* If the ship is locked, show cost and "Buy" button */}
                {unlock ? (
                    // If unlocked, show status and select button
                    <View style={styles.statusContainer}>
                        <Text style={{ ...styles.statusText, display: active ? 'flex' : 'none' }}>
                            {active ? 'Active' : ''}
                        </Text>
                        {!active && (
                            <TouchableOpacity style={styles.selectButton}>
                                <Text style={styles.buttonText}>Select</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    // If locked, show the cost and "Buy" button
                    <View style={styles.statusContainer}>
                        <Text style={styles.costText}>Cost: {cost} Coins</Text>
                        <TouchableOpacity style={styles.buyButton}>
                            <Text style={styles.buttonText}>Buy</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ImageBackground source={require('../assets/imgaes/background2.jpg')} style={styles.background}>
            <View style={styles.containerInner}>
                {/* Title */}
                <Text style={styles.title}>Shop</Text>
                <View style={styles.coinContainer}>
                    <Image source={require('../assets/imgaes/goldcoin.gif')} style={styles.coin} />
                    <Text style={{ color: '#fff', fontFamily: 'Audiowide-Regular' }}>{userDetail.Coins}</Text>
                </View>
                <Text style={{ ...styles.title, fontSize: 16, marginBottom: 0 }}>Space Ships :</Text>

                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} contentContainerStyle={{
                    height: 220
                }}>
                    {shipData?.Ships?.length > 0 && shipData.Ships.map((item, index) => <ShipCard ship={item} index={index} />)
                    }
                </ScrollView>
            </View>
        </ImageBackground >
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerInner: {
        paddingVertical: 30,
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    coinContainer: {
        marginHorizontal: 15,
        paddingVertical: 0,
        borderRadius: 30,
        borderWidth: 0,
        borderColor: 'transparent',
        width: 75,
        height: 35,
        backgroundColor: '#6200EE',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 50,
        right: 0
    },
    coin: {
        width: 20, // Adjust based on image size
        height: 20,
    },
    title: {
        fontSize: 36,
        color: '#FFF',
        fontFamily: 'Audiowide-Regular', // Use a pixelated font
        marginBottom: 25,
        marginLeft: 20,
        marginTop: 10
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    card: {
        // width: 200,
        // height: '100%',
        backgroundColor: '#1e1e1e',
        borderRadius: 20,
        padding: 15,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        // justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 2,
        borderColor: Color.primaryColor
    },
    image: {
        width: 65,
        height: 65,
        borderRadius: 10,
        marginBottom: 10,
    },
    name: {
        color: '#fff',
        fontSize: 16,
        // marginBottom: 10,
        fontFamily: 'Audiowide-Regular'
    },
    statusContainer: {
        width: '100%',
        alignItems: 'center',
    },
    statusText: {
        color: Color.green,
        fontSize: 12,
        // marginBottom: 10,
        fontFamily: 'Audiowide-Regular',
        marginTop: 10
    },
    costText: {
        color: Color.white, // Tomato color for cost
        fontSize: 14,
        fontWeight: '500',
        // marginBottom: 10,
        marginTop: 5,
        fontFamily: 'Audiowide-Regular'
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Audiowide-Regular'
    },
    buyButton: {
        marginTop: 10,
        backgroundColor: Color.primaryColor,
        paddingVertical: 5,
        paddingHorizontal: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectButton: {
        marginTop: 10,
        backgroundColor: Color.primaryColor,
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Shop;