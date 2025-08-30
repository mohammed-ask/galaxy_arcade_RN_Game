import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, ScrollView, TouchableOpacity, Modal, BackHandler, Alert } from 'react-native';
import { Color, isEmpty, powerUpIcons, spaceShipIcons } from '../utils';
import { BlurView } from '@react-native-community/blur';
import TouchableScale from 'react-native-touchable-scale';

const Shop = ({ navigation }) => {
    const [shipData, setShipData] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [shipId, setShipId] = useState({});
    const [showCoinAlert, setShowCoinAlert] = useState('');
    const [userDetail, setUserDetail] = useState({ userName: '', bestScore: '', Coins: '' });

    useEffect(() => {
        (async () => {
            // AsyncStorage.setItem('Coins', '15000')
        })()
        const backAction = () => {
            navigation.navigate('MainMenu')
            return true
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        // Clean up the event listener on component unmount
        return () => backHandler.remove();
    }, []);

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

    const handleBuyShip = () => {
        try {
            if (userDetail.Coins >= shipId.cost) {
                setShipData(prevState => ({
                    ...prevState,
                    Ships: prevState.Ships.map(ship =>
                        ship.id === shipId.id ? { ...ship, unlock: true } : ship
                    )
                }));
                const coins = userDetail.Coins
                const remainingCoin = coins - shipId.cost
                AsyncStorage.setItem('Coins', remainingCoin.toString())
                setUserDetail(prev => ({
                    ...prev,
                    Coins: remainingCoin
                }));
                setModalVisible(false)
            } else {
                setShowCoinAlert('You dont have enough coins to buy this Spaceship!')
            }
        } catch (e) {
            console.log(e)
        }
    }

    const updateShipActive = (id) => {
        setShipData(prevState => ({
            ...prevState,
            Ships: prevState.Ships.map(ship =>
                ship.id === id
                    ? { ...ship, active: true }
                    : { ...ship, active: false }
            )
        }));
    };

    const upgradePowerUp = (powerUpName, cost) => {
        try {
            console.log(cost)
            if (userDetail.Coins > cost) {
                setShipData(prevState => ({
                    ...prevState,
                    powerUps: prevState.powerUps.map(powerUp => {
                        if (powerUp.name === powerUpName && powerUp.level < powerUp.maxLevel) {
                            // Calculate new upgrade cost and duration
                            const newUpgradeCost = Math.round(powerUp.upgradeCost * 1.15); // Increase cost by 15%
                            const newDuration = Math.round(powerUp.duration * 1.20); // Increase duration by 20%
                            const newLevel = powerUp.level + 1; // Increase level

                            return {
                                ...powerUp,
                                level: newLevel,
                                upgradeCost: newUpgradeCost,
                                duration: newDuration,
                            };
                        }
                        return powerUp;
                    })
                }));
                const coins = userDetail.Coins
                const remainingCoin = coins - cost
                AsyncStorage.setItem('Coins', remainingCoin.toString())
                setUserDetail(prev => ({
                    ...prev,
                    Coins: remainingCoin
                }));
                console.log('done')
            } else {
                setModalVisible(true)
                setShowCoinAlert('You dont have enough coins to upgrade!')
            }
        } catch (e) {
            console.log(e)
        }
    };

    useEffect(() => {
        (async () => {
            if (!isEmpty(shipData)) {
                await AsyncStorage.setItem('Store', JSON.stringify(shipData))
            }
        })()
    }, [shipData])

    const ShipCard = ({ ship, index }) => {
        const { name, unlock, cost, active, id, specs } = ship;
        const [showTooltip, setShowTooltip] = useState(false);  // Tooltip visibility state

        return (
            <ImageBackground blurRadius={1} style={styles.card}>
                {/* Info Icon */}
                <View style={{ ...styles.infoContainer, display: isEmpty(specs) ? 'none' : 'flex' }}>
                    <TouchableOpacity
                        style={styles.infoIcon}
                        onPress={() => setShowTooltip(!showTooltip)} // Toggle tooltip visibility
                    >
                        <Image source={require('../assets/imgaes/info.png')} style={styles.iconImage} />
                    </TouchableOpacity>

                    {/* Tooltip */}
                    {showTooltip && (
                        <View style={styles.tooltip}>
                            {specs.map(item => <Text style={styles.tooltipText}>
                                {item}
                            </Text>)}
                        </View>
                    )}
                </View>
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
                            <TouchableScale onPress={() => updateShipActive(id)} style={styles.selectButton}>
                                <Text style={styles.buttonText}>Select</Text>
                            </TouchableScale>
                        )}
                    </View>
                ) : (
                    // If locked, show the cost and "Buy" button
                    <View style={styles.statusContainer}>
                        <Text style={styles.costText}>Cost: {cost} Coins</Text>
                        <TouchableScale onPress={() => { setShipId({ id: id, cost: cost }); setModalVisible(true) }} style={styles.buyButton}>
                            <Text style={styles.buttonText}>Buy</Text>
                        </TouchableScale>
                    </View>
                )}
            </ImageBackground>
        );
    };

    const PowerUpCard = ({ powerItem, index }) => {
        const { name, level, upgradeCost, maxLevel } = powerItem;

        return (
            <View style={styles.powerUpCard}>
                {/* Left section: Name and Level */}
                <View style={{ width: '30%' }}>
                    <Image source={powerUpIcons[index].source} style={styles.powerUpIcon} />
                </View>
                <View style={styles.powerUpInfo}>
                    <Text style={styles.powerUpName}>{name}</Text>
                    <Text style={styles.powerUpLevel}>Lv: {level}/{maxLevel}</Text>
                </View>

                {/* Right section: Upgrade Cost and Button */}
                <View style={styles.powerUpActions}>
                    {maxLevel === level ?
                        <>
                            <TouchableScale
                                style={styles.upgradeButton}
                            // onPress={() => upgradePowerUp(powerItem.name, upgradeCost)}
                            >
                                <Text style={styles.buttonText}>Maxed Level</Text>
                            </TouchableScale>
                        </>
                        : <>
                            <Text style={styles.powerUpCost}>{upgradeCost} Coins</Text>
                            <TouchableScale
                                style={styles.upgradeButton}
                                onPress={() => upgradePowerUp(powerItem.name, upgradeCost)}
                            >
                                <Text style={styles.buttonText}>Upgrade</Text>
                            </TouchableScale>
                        </>}
                </View>
            </View>
        );
    }

    return (
        <ImageBackground source={require('../assets/imgaes/background3.jpg')} style={styles.background}>
            <BlurView style={{ width: '100%', flex: 1 }} blurType="light" blurAmount={1} overlayColor='rgba(0,0,0,0.1)'>
                <View style={styles.containerInner}>
                    {/* Title */}
                    <Text style={styles.title}>Shop</Text>
                    <View style={styles.coinContainer}>
                        <Image source={require('../assets/imgaes/goldcoin.gif')} style={styles.coin} />
                        <Text style={{ color: '#fff', fontFamily: 'Audiowide-Regular' }}>{userDetail.Coins}</Text>
                    </View>
                    <Text style={{ ...styles.title, fontSize: 16, marginBottom: 0 }}>Space Ships :</Text>

                    <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} contentContainerStyle={{
                        height: 220, marginBottom: 10
                    }}>
                        {shipData?.Ships?.length > 0 && shipData.Ships.map((item, index) => <ShipCard key={index} ship={item} index={index} />)
                        }
                    </ScrollView>

                    <Text style={{ ...styles.title, fontSize: 16, marginBottom: 10 }}>Power Ups :</Text>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
                        marginTop: 0, marginVertical: 0, marginStart: 0
                    }}>
                        {shipData?.powerUps?.length > 0 && shipData.powerUps.map((item, index) => <PowerUpCard key={index} powerItem={item} index={index} />)
                        }
                    </ScrollView>
                </View>
            </BlurView>
            <Modal animationType="fade" transparent={true} visible={modalVisible}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent]}>
                        {isEmpty(showCoinAlert) ?
                            <>
                                <Text style={styles.modalTitle}>Are you sure you wanna buy this Spaceship?</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                                    <TouchableOpacity style={{ ...styles.modalButton, backgroundColor: 'gray' }} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.modalButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalButton} onPress={() => handleBuyShip(shipId)}>
                                        <Text style={styles.modalButtonText}>🚀 Yes</Text>
                                    </TouchableOpacity>
                                </View>
                            </> :
                            <>
                                <Text style={styles.modalTitle}>{showCoinAlert}</Text>
                                <TouchableOpacity style={{ ...styles.modalButton, backgroundColor: 'gray' }} onPress={() => { setModalVisible(false); setShowCoinAlert('') }}>
                                    <Text style={styles.modalButtonText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        }
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerInner: {
        paddingTop: 30,
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
        backgroundColor: 'rgba(30, 30, 30,0.3)', //'#1e1e1e',
        borderRadius: 20,
        padding: 15,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        // justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#393939', // Subtle border to add some depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // elevation: 3,
    },
    image: {
        width: 65,
        height: 65,
        borderRadius: 10,
        marginBottom: 10,
        zIndex: -5
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
        marginTop: 10,
        paddingVertical: 8
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    modalContent: {
        backgroundColor: '#222',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: '80%',
        borderWidth: 3,
        borderColor: '#6200EE',
        elevation: 10
    },
    modalTitle: {
        fontSize: 14,
        color: '#FFF',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
        fontFamily: 'Audiowide-Regular',
    },
    modalButton: {
        marginTop: 20,
        backgroundColor: '#6200EE',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#fff',
        width: '45%'
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Audiowide-Regular',
        textAlign: 'center'
    },
    powerUpCard: {
        flexDirection: 'row', // Row layout for name/level on left, button on right
        backgroundColor: 'rgba(30, 30, 30, 0.5)', // Dark background with slight opacity
        padding: 10,
        borderRadius: 10,
        marginVertical: 8,
        marginHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#393939', // Subtle border to add some depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        width: '95%', // Smaller, more compact width
    },

    powerUpIcon: {
        width: 75,
        height: 75
    },
    powerUpInfo: {
        width: '40%',
        flexDirection: 'column',
        justifyContent: 'center',
    },

    powerUpName: {
        textTransform: 'capitalize',
        fontSize: 14,
        color: '#FFF',
        fontFamily: 'Audiowide-Regular',
    },

    powerUpLevel: {
        fontSize: 12,
        color: '#AAAAAA',
        fontFamily: 'Audiowide-Regular',
        marginTop: 2,
    },

    powerUpActions: {
        flexDirection: 'column',
        alignItems: 'center',
    },

    powerUpCost: {
        fontSize: 12,
        color: 'yellow', // Gold color for the upgrade cost
        fontFamily: 'Audiowide-Regular',
        marginBottom: 5,
    },

    upgradeButton: {
        backgroundColor: Color.primaryColor, // Green button
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: 'Audiowide-Regular',
    },
    backButton: {
        backgroundColor: '#6200EE', // Gold color for buttons
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 10,
        // marginTop: 40,
        width: '40%',
        alignSelf: 'center'
    },
    backButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'Audiowide-Regular', // Use a pixelated font
    },
    infoContainer: {
        position: 'relative', // Ensure the tooltip is positioned relative to the icon
        backgroundColor: 'transparent',
        alignSelf: 'flex-end'
    },
    infoIcon: {
        marginTop: 5,
        width: 20,
        height: 20,
        alignSelf: 'center',
    },
    iconImage: {
        width: '100%',
        height: '100%',
    },
    tooltip: {
        position: 'absolute',
        top: 20, // Position above the icon
        right: 10, // Adjust for centering
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        borderRadius: 10,
        zIndex: 50,
        width: '100%',
        alignItems: 'center',
    },
    tooltipText: {
        color: '#fff',
        fontSize: 10,
        textAlign: 'center',
        fontFamily: 'Audiowide-Regular',
    },
});

export default Shop;