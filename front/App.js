import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Nav from './components/Nav';
import UserContext from './contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from './config';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem('@user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('parsedUser', parsedUser);
        try {
          await axios.get(`${API_BASE_URL}/user/${parsedUser.id}`);
          setUser(parsedUser);
        } catch (error) {
          console.error(error);
          AsyncStorage.removeItem('@user');
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Nav />
      </NavigationContainer>
    </UserContext.Provider>
  );
}
