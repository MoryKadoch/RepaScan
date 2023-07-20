import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import UserContext from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const LogIn = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser, user } = useContext(UserContext);

    const handleLogIn = async () => {
        try {
            const response = await axios.post(API_BASE_URL + '/login', {
                email: email,
                password: password
            });
            if (response.data.id) {
                setUser(response.data);
                await AsyncStorage.setItem('@user', JSON.stringify(response.data));
                navigation.navigate('Main', { screen: 'Rerchercher' });
            } else if (response.data === "Wrong credentials") {
                Alert.alert('Erreur', 'Mot de passe ou email incorrect.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion.');
        }
    };
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connexion</Text>
            <TextInput
                value={email}
                onChangeText={(email) => setEmail(email)}
                placeholder={'Email'}
                style={styles.input}
                autoCapitalize='none'
            />
            <TextInput
                value={password}
                onChangeText={(password) => setPassword(password)}
                placeholder={'Mot de passe'}
                secureTextEntry={true}
                style={styles.input}
                autoCapitalize='none'
            />
            <View style={styles.buttonContainer}>
                <Button
                    title={'Se connecter'}
                    color='#007BFF'
                    onPress={handleLogIn}
                />
            </View>
            <View style={styles.alreadyAccountContainer}>
                <Text style={styles.alreadyAccountText}>Vous n'avez pas de compte?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.loginText}>S'inscrire</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        padding: 10,
    },
    buttonContainer: {
        marginTop: 10,
    },
    title: {
        fontSize: 30,
        textAlign: 'center',
        marginBottom: 40,
    },
    alreadyAccountContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
    },
    alreadyAccountText: {
        marginRight: 10,
    },
    loginText: {
        color: '#007BFF',
    },
});

export default LogIn;
