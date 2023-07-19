import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';

const SignUp = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        try {
            const response = await axios.post('http://192.168.1.6:5000/signup', {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            });
            if (response.data) {
                Alert.alert('Inscription terminée', 'Inscription pour ' + email + ' réussie!');
                navigation.navigate('Main', { screen: 'Scan' });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription.');
        }
    };

    return (
        <View style={styles.container}>
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
            <View style={styles.buttonContainer}>
                <Button
                    title={'S\'inscrire'}
                    color='#007BFF'
                    onPress={handleSignUp}
                />
            </View>
            <View style={styles.alreadyAccountContainer}>
                <Text style={styles.alreadyAccountText}>Vous avez déjà un compte?</Text>
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

export default SignUp;
