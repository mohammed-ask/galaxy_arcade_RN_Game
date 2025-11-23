import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    StatusBar,
    ImageBackground,
    BackHandler,
    Animated
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const LeaderboardScreen = ({ navigation }) => {
    const data = [
        { name: "Mike", score: 1080 },
        { name: "John", score: 1100 },
        { name: "Samuel", score: 1500 },
        { name: "Karen", score: 1260 },
        { name: "Yuki", score: 1600 },
    ];

    // Initialize animations after data is defined
    const itemAnimations = useRef(data.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        (async () => {
            // AsyncStorage.setItem('Coins', '15000')
        })();

        // Animate items sequentially
        const animateItems = () => {
            const animations = itemAnimations.map((anim, index) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 300,
                    delay: index * 100,
                    useNativeDriver: true,
                })
            );
            Animated.stagger(100, animations).start();
        };

        animateItems();

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
            style={[
                styles.itemContainer,
                index === 0 && styles.topItem,
                {
                    opacity: itemAnimations[index],
                    transform: [
                        {
                            translateY: itemAnimations[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                            })
                        }
                    ]
                }
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
        <ImageBackground source={require('../assets/imgaes/background3.jpg')} style={styles.container}>
            <StatusBar hidden={true} barStyle="light-content" />
            <BlurView style={{ width: '100%', flex: 1 }} blurType="light" blurAmount={1} overlayColor='rgba(0,0,0,0.1)'>
                <View style={styles.containerInner}>
                    <Text style={styles.title}>Leaderboard</Text>
                    <FlatList
                        data={sortedData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.name}
                        contentContainerStyle={styles.listContainer}
                    />
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
        fontFamily: 'Audiowide-Regular',
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
        fontFamily: 'Audiowide-Regular',
    },
    infoContainer: {
        flex: 1,
    },
    nameText: {
        color: '#FFFFFF',
        fontSize: 18,
        marginBottom: 5,
        fontFamily: 'Audiowide-Regular',
    },
    scoreText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        fontFamily: 'Audiowide-Regular',
    },
});

export default LeaderboardScreen;