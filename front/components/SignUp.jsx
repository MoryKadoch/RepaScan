import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import UserContext from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper';
import logo from '../assets/RepaScan-logo.png';

const SignUp = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const { setUser } = useContext(UserContext);

    const handleSignUp = async () => {
        if (firstName === '' || lastName === '' || email === '' || password === '' || gender === '') {
            Alert.alert('Erreur', 'Tous les champs doivent être remplis.');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        try {
            const response = await axios.post(API_BASE_URL + '/signup', {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                gender: gender
            });
            if (response.data) {
                Alert.alert('Inscription terminée', 'Inscription pour ' + email + ' réussie!');
                setUser(response.data);
                await AsyncStorage.setItem('@user', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription.');
        }
    };

    return (
        <View style={styles.container}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.title}>Inscription</Text>
            <TextInput
                value={firstName}
                onChangeText={(firstName) => setFirstName(firstName)}
                placeholder={'Prénom'}
                style={styles.input}
            />
            <TextInput
                value={lastName}
                onChangeText={(lastName) => setLastName(lastName)}
                placeholder={'Nom'}
                style={styles.input}
            />
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
            <Text>Vous êtes :</Text>
            <RadioButton.Group onValueChange={newValue => setGender(newValue)} value={gender}>
                <View style={styles.radioButton}>
                    <Text>Un homme</Text>
                    <RadioButton value="homme" />
                    <Text>Une femme</Text>
                    <RadioButton value="femme" />
                </View>
            </RadioButton.Group>
            <View style={styles.buttonContainer}>
                <Button
                    title={'S\'inscrire'}
                    color='#007BFF'
                    onPress={handleSignUp}
                />
            </View>
            <View style={styles.alreadyAccountContainer}>
                <Text style={styles.alreadyAccountText}>Vous avez déjà un compte ?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
                    <Text style={styles.loginText}>Se connecter</Text>
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
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
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
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: 20,
    },
});

export default SignUp;
