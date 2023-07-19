import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Scan from './Scan';
import SignUp from './SignUp';
import LogIn from './LogIn';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Scan') {
                        iconName = focused ? 'ios-barcode' : 'ios-barcode-outline';
                    }

                    // You can return any component that you like here!
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: [
                    {
                        display: 'flex'
                    },
                    null
                ]
            })}
        >
            <Tab.Screen name="Scan" component={Scan} />
        </Tab.Navigator>
    );
}

function NavStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="SignUp" 
                component={SignUp}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="LogIn"
                component={LogIn}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="Main" 
                component={TabNavigator}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

export default NavStack;
