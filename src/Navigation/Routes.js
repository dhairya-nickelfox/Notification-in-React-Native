import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import ProductDetail from '../Screens/ProductDetail/ProductDetail';
import Home from '../Screens/Home';
import Settings from '../Screens/Setting';
import NavigationService from './NavigationService';


const Stack = createNativeStackNavigator();

export function Route() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Settings" component={Settings} />
               
            </Stack.Navigator>
        </NavigationContainer>
    )
}