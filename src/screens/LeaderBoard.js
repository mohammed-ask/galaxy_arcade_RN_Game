import { BlurView } from '@react-native-community/blur';
import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    StatusBar,
    ImageBackground,
    BackHandler
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
    FadeInDown
} from 'react-native-reanimated';

const LeaderboardScreen = ({ navigation }) => {
    const data = [
        { name: "Rashmi", score: 1080 },
        { name: "Mustufa Taher", score: 1100 },
        { name: "Parag Chahal", score: 1500 },
        { name: "Mahesh Raj", score: 1260 },
        { name: "Fateh Mohammad", score: 1600 },
    ];

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

    // Sort data by score in descending order
    const sortedData = [...data].sort((a, b) => b.score - a.score);

    const renderItem = ({ item, index }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100)}
            style={[
                styles.itemContainer,
                index === 0 && styles.topItem
            ]}
        >
            <LinearGradient
                colors={
                    index === 0
                        ? ['#FFD700', '#FFA500']
                        : index === 1
                            ? ['#C0C0C0', '#808080']
                            : index === 2
                                ? ['#CD7F32', '#8B4513']
                                : ['#4B5EAA', '#2D3766']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <View style={styles.rankContainer}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.nameText}>{item.name}</Text>
                    <Text style={styles.scoreText}>{item.score} pts</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );

    return (
        <ImageBackground source={require('../assets/imgaes/background2.jpg')} style={styles.container}>
            <StatusBar barStyle="light-content" />
            <BlurView style={{ width: '100%', flex: 1 }} blurType="light" blurAmount={1} overlayColor='rgba(0,0,0,0.1)'>
                <View style={styles.containerInner}>
                    <Text style={styles.title}>Leaderboard</Text>
                    {/* <LinearGradient
                colors={['#1E1F34', '#121212']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.background}
            > */}
                    {/* <Text style={styles.header}>Leaderboard</Text> */}
                    <FlatList
                        data={sortedData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.name}
                        contentContainerStyle={styles.listContainer}
                    />
                    {/* </LinearGradient> */}
                </View>
            </BlurView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: 'transparent'
    },
    containerInner: {
        paddingTop: 30,
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    title: {
        fontSize: 36,
        color: '#FFF',
        fontFamily: 'Audiowide-Regular', // Use a pixelated font
        marginBottom: 25,
        marginLeft: 20,
        marginTop: 10
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    itemContainer: {
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    topItem: {
        transform: [{ scale: 1.05 }],
    },
    gradient: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
    rankContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    rankText: {
        color: '#FFFFFF',
        fontSize: 18,
        // fontWeight: 'bold',
        fontFamily: 'Audiowide-Regular',
    },
    infoContainer: {
        flex: 1,
    },
    nameText: {
        color: '#FFFFFF',
        fontSize: 18,
        // fontWeight: '600',
        marginBottom: 5,
        fontFamily: 'Audiowide-Regular',
    },
    scoreText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        // fontWeight: '500',
        fontFamily: 'Audiowide-Regular',
    },
});

export default LeaderboardScreen;