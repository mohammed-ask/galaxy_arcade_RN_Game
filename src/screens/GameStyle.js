import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    containerImg: { flex: 1, zIndex: 2 },
    container: { flex: 1 },
    score: { color: 'white', fontSize: 24, fontFamily: 'Audiowide-Regular' },
    lives: { position: 'absolute', top: 80, left: 20, color: 'white', fontSize: 24, fontWeight: 'bold', flexDirection: 'row' },
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
    coinText: {
        fontFamily: 'Audiowide-Regular',
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
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    modalOverlay: {
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    modalBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContentLevel: {
        backgroundColor: 'transparent',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        minWidth: 250,
    },
    animatedText: {
        fontSize: 28,
        fontFamily: 'Audiowide-Regular',
        color: '#FF6B6B',
        marginBottom: 20,
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#6C757D',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});
export default styles;
