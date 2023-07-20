import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Alert, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import UserContext from '../contexts/UserContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const History = () => {
    const [history, setHistory] = useState([]);
    const { user, setUser } = useContext(UserContext);
    const navigation = useNavigation();

    const handleLogout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('@user');
        navigation.navigate('LogIn');
    };

    const fetchHistory = async () => {
        try {
            const response = await axios.get(API_BASE_URL + '/history/' + user.id, {
                headers: {
                    'Authorization': `Bearer ${user.access_token}`
                }
            });

            const productCodes = response.data;
            const promises = productCodes.map(code =>
                axios.get(`https://world.openfoodfacts.net/api/v2/product/${code}.json`)
            );

            const results = await Promise.all(promises);
            const products = results.map(result => result.data.product);

            setHistory(products);
        } catch (error) {
            console.error(error);
            //Alert.alert('Error', 'An error occurred while fetching the history.');
            handleLogout();
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            if (user && user.id) {
                fetchHistory();
            }
        }, [user])
    );

    const handlePress = (product) => {
        navigation.navigate('ProductDetail', { product });
    };

    const handleDelete = (product) => {
        Alert.alert(
            "Suppression",
            "Voulez-vous vraiment supprimer ce produit ?",
            [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => {
                        axios.delete(`http://10.74.3.105:5000/history/${user.id}/${product.code}`)
                            .then(response => {
                                // Refresh history after delete
                                axios.get(API_BASE_URL + '/history/' + user.id, {
                                    headers: {
                                        'Authorization': `Bearer ${user.access_token}`
                                    }
                                })
                                    .then(response => {
                                        const productCodes = response.data;
                                        const promises = productCodes.map(code =>
                                            axios.get(`https://world.openfoodfacts.net/api/v2/product/${code}.json`)
                                        );
                                        Promise.all(promises)
                                            .then(results => {
                                                const products = results.map(result => result.data.product);
                                                setHistory(products);
                                            })
                                    })
                            })
                            .catch(error => console.error(error));
                    }
                }
            ]
        );
    };

    const handleScan = () => {
        navigation.navigate('Scan');
    };

    if (history.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Aucun scan pour l'instant.</Text>
                <Button onPress={handleScan} title="Scanner un produit" color="#841584" accessibilityLabel="Scan a product" />
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <FlatList
                    data={history}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <TouchableOpacity style={styles.touchable} onPress={() => handlePress(item)}>
                                <Image style={styles.image} source={{ uri: item.image_small_url }} />
                                <Text style={styles.name}>{item.product_name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteTouchable} onPress={() => handleDelete(item)}>
                                <Text style={styles.deleteText}>X</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 5,
        borderColor: '#ccc',
        borderWidth: 1,
        backgroundColor: '#fff',
    },
    touchable: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
    },
    deleteTouchable: {
        padding: 10,
    },
    deleteText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'red',
        borderRadius: 2,
        width: 15,
        height: 15,
        textAlign: 'center',
        textAlignVertical: 'center',

    },
    image: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    name: {
        fontSize: 16,
    },
});

export default History;
