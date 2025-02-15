// Navigation File
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainMenuScreen from './src/screens/MainMenuScreen.js';
import GameScreen from './src/screens/GameScreen.js';

const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainMenu" component={MainMenuScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      {/* Add other screens here */}
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;