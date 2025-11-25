// Navigation File
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainMenuScreen from './src/screens/MainMenuScreen.js';
import GameScreen from './src/screens/GameScreen.js';
// import GameScreen from './src/screens/GameScreenxx.js';
import SplashScreen from './src/screens/Splash.js';
import Settings from './src/screens/Setting.js';
import Shop from './src/screens/Shop.js';
import Temp from './src/screens/temp.js';
import LeaderBoard from './src/screens/LeaderBoard.js';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { LogBox } from 'react-native';

const Stack = createStackNavigator();

const App = () => {
  SystemNavigationBar.stickyImmersive()
  const IGNORED_LOGS = [
    'Non-serializable values were found in the navigation state',
    'Warning: Each child in a list should have a unique',
    '[Reanimated] Tried to modify key',
    'VirtualizedLists should never be nested',
    'Open debugger',
    'It looks like you might be using shared'
  ];

  LogBox.ignoreLogs(IGNORED_LOGS);

  if (__DEV__) {
    const withoutIgnored =
      logger =>
        (...args) => {
          const output = args.join(' ');

          if (!IGNORED_LOGS.some(log => output.includes(log))) {
            logger(...args);
          }
        };

    console.log = withoutIgnored(console.log);
    console.info = withoutIgnored(console.info);
    console.warn = withoutIgnored(console.warn);
    console.error = withoutIgnored(console.error);
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }} >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Shop" component={Shop} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="LeaderBoard" component={LeaderBoard} />
        <Stack.Screen name="Temp" component={Temp} />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer >
  )
};

export default App;