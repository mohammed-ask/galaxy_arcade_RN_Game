// Navigation File
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainMenuScreen from './src/screens/MainMenuScreen.js';
import GameScreen from './src/screens/GameScreen.js';
// import GameScreen from './src/screens/GameScreenxx.js';
import SplashScreen from './src/screens/Splash.js';
import Settings from './src/screens/Setting.js';
import Shop from './src/screens/Shop.js';

const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }} >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="MainMenu" component={MainMenuScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="Shop" component={Shop} />
      <Stack.Screen name="Settings" component={Settings} />
      {/* Add other screens here */}
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;