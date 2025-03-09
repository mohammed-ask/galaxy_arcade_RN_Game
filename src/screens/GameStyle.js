import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    containerImg: { flex: 1, zIndex: 2 },
    container: { flex: 1 },
    score: { position: 'absolute', top: 40, left: 20, color: 'white', fontSize: 24, fontFamily: 'Audiowide-Regular' },
    lives: { position: 'absolute', top: 80, left: 20, color: 'white', fontSize: 24, fontWeight: 'bold' },
    // coins: { position: 'absolute', top: 40, right: 20, color: 'white', fontSize: 24, fontWeight: 'bold' },
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
        fontSize: 20,
        marginBottom: 20,
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
        shadowColor: '#fff'
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Audiowide-Regular',
    },
    coin: {
        width: 20, // Adjust based on image size
        height: 20,
    },
    timer: {
        position: 'absolute',
        top: 160, // Adjust position as needed
        left: 20,
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    megaBombContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    megaBombIcon: {
        width: 50,
        height: 50,
    },
    megaBombCount: {
        color: 'white',
        fontSize: 18,
        marginLeft: -10,
        fontFamily: 'Audiowide-Regular',
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
        top: 40,
        right: 0
    },
});
export default styles;
