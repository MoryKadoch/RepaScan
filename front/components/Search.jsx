import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../contexts/UserContext';
import { View, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Text, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Search = () => {
    const [searchMode, setSearchMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const { user } = useContext(UserContext);

    const handleScan = () => {
        navigation.navigate('Scan');
    };

    const handleSearchMode = () => {
        setSearchMode(!searchMode);
        setSearchTerm("");
        setSearchResults([]);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value.length > 2) {
            setIsLoading(true);
            axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${value}&search_simple=1&action=process&json=1`)
                .then(response => {
                    setSearchResults(response.data.products);
                    setIsLoading(false);
                });
        } else {
            setSearchResults([]);
            setIsLoading(false);
        }
    };

    const handleSelectProduct = (product) => {
        setSearchMode(false);
        setSearchTerm("");
        setSearchResults([]);
        axios.post(API_BASE_URL + '/history', {
            user_id: user.id,
            product_code: product.code,
        }, {
            headers: {
                'Authorization': `Bearer ${user.access_token}`
            }
        })
            .then(response => console.log(response))
            .catch(
                error => {
                    console.error(error);
                    alert('Impossible d\'ajouter le produit à l\'historique');
                }
            );
        navigation.navigate('ProductDetail', { product });
    };

    if (!searchMode) {
        return (
            <View style={styles.container}>
                <Button style={styles.button} onPress={handleScan} title="Scanner un produit" />
                <View style={{ height: 20 }} />
                <Button style={styles.button} onPress={handleSearchMode} title="Rechercher un produit" />
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <TextInput
                    style={styles.searchBox}
                    onChangeText={handleSearch}
                    value={searchTerm}
                    placeholder="Recherchez un produit..."
                />
                {isLoading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <FlatList
                        data={searchResults}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.item} onPress={() => handleSelectProduct(item)}>
                                <Image style={styles.image} source={{ uri: item.image_small_url }} />
                                <Text style={styles.name}>{item.product_name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 10,
    },
    button: {
        marginBottom: 10,
    },
    searchBox: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
        borderRadius: 10,
    },
    item: {
        flexDirection: 'row',
        padding: 10,
        marginBottom: 5,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    name: {
        fontSize: 18,
    },
});

export default Search;
