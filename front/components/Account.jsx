import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import UserContext from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Account = ({ navigation }) => {
    const { user, setUser } = useContext(UserContext);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (user) {
            axios.get(API_BASE_URL + '/user/' + user.id)
                .then(response => {
                    setFirstName(response.data.firstname);
                    setLastName(response.data.lastname);
                    setEmail(response.data.email);
                    //console.log(response.data);
                })
                .catch(error => console.error(error));
        }
    }, [user]);

    const handleLogout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('@user');
        navigation.navigate('LogIn');
    };

    const handleUpdate = async () => {
        try {
            let updatedDetails = {
                firstName: firstName,
                lastName: lastName,
                email: email,
            };

            if (password.trim() !== '') {
                updatedDetails.password = password;
            }
            const response = await axios.put(API_BASE_URL + '/user/update/' + user.id, updatedDetails, {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                Alert.alert('Mise à jour réussie', 'Vos informations ont été mises à jour.');
                const updatedUser = {
                    id: user.id,
                    email: email,
                    access_token: user.access_token
                };
                setUser(updatedUser);
                await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred during the update.');
            setUser(null);
            AsyncStorage.removeItem('@user');
            navigation.navigate('LogIn');
        }
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            "Confirmation de suppression",
            "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
            [
                {
                    text: "Annuler",
                    onPress: () => console.log("Suppression annulée"),
                    style: "cancel"
                },
                {
                    text: "Supprimer",
                    onPress: async () => {
                        try {
                            await axios.delete(API_BASE_URL + '/user/delete/' + user.id, {
                                headers: {
                                    'Authorization': `Bearer ${user.access_token}`
                                }
                            });
                            handleLogout();
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Error', 'An error occurred while deleting the account.');
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
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
                placeholder={'Adresse email'}
                style={styles.input}
                autoCapitalize='none'
            />
            <TextInput
                value={password}
                onChangeText={(password) => setPassword(password)}
                placeholder={'Mot de passe *'}
                secureTextEntry={true}
                style={styles.input}
                autoCapitalize='none'
            />
            <Text>* Laissez vide si vous ne souhaitez pas modifier votre mot de passe</Text>
            <View style={styles.buttonContainer}>
                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <Button
                            title={'Mettre à jour'}
                            color='#007BFF'
                            onPress={handleUpdate}
                        />
                    </View>
                    <View style={styles.button}>
                        <Button
                            title={'Se déconnecter'}
                            color='#3E3E3E'
                            onPress={handleLogout}
                        />
                    </View>
                    <View style={styles.deleteAccountContainer}>
                        <TouchableOpacity
                            onPress={handleDeleteAccount}
                        >
                            <Text style={styles.deleteAccountText}>Supprimer le compte</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
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
    loginText: {
        color: '#007BFF',
    },
    deleteAccountContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    deleteAccountText: {
        color: '#FF0000',
    },
    button: {
        marginBottom: 10,
    },
});

export default Account;
