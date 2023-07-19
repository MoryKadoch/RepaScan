import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Nav from './components/Nav';
import UserContext from './contexts/UserContext';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Nav />
      </NavigationContainer>
    </UserContext.Provider>
  );
}
