import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import UserContext from '../contexts/UserContext';
import SignUp from './SignUp';
import LogIn from './LogIn';
import Scan from './Scan';
import History from './History';
import ProductDetail from './ProductDetail';
import Account from './Account';
import Search from './Search';
import Goals from './Goals';
import Dashboard from './Dashboard';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Rechercher') {
                        iconName = focused ? 'ios-search' : 'ios-search-outline';
                    }
                    if (route.name === 'Historique') {
                        iconName = focused ? 'ios-list' : 'ios-list-outline';
                    }
                    if (route.name === 'Mon compte') {
                        iconName = focused ? 'ios-person' : 'ios-person-outline';
                    }
                    if (route.name === 'Objectifs') {
                        iconName = focused ? 'ios-trophy' : 'ios-trophy-outline';
                    }
                    if (route.name === 'Tableau de bord') {
                        iconName = focused ? 'ios-home' : 'ios-home-outline';
                    }
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
            <Tab.Screen name="Tableau de bord" component={Dashboard} />
            <Tab.Screen name="Rechercher" component={Search} />
            <Tab.Screen name="Scan" component={Scan} options={{ tabBarButton: () => null, tabBarVisible: false }} />
            <Tab.Screen name="Historique" component={History} />
            <Tab.Screen name="ProductDetail" component={ProductDetail} options={{ tabBarButton: () => null, tabBarVisible: false }} />
            <Tab.Screen name="Objectifs" component={Goals} />
            <Tab.Screen name="Mon compte" component={Account} />
        </Tab.Navigator>
    );
}

const AuthStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ headerShown: false }}
        />
    </Stack.Navigator>
);

const GuestStack = () => (
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
    </Stack.Navigator>
);

const Nav = () => {
    const { user } = useContext(UserContext);
    return user ? <AuthStack /> : <GuestStack />;
};

export default Nav;
