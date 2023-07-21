import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../contexts/UserContext';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const Scan = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(UserContext);

    navigation.setOptions({
        title: 'Scanner un produit',
    });

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            setScanned(false);
        }, [])
    );

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        setLoading(true);
        axios.get(`https://world.openfoodfacts.net/api/v2/product/${data}.json`)
            .then((response) => {
                axios.post(API_BASE_URL + '/history', {
                    user_id: user.id,
                    product_code: data,
                }, {
                    headers: {
                        'Authorization': `Bearer ${user.access_token}`
                    }
                })
                    .then(response => console.log(response))
                    .catch(
                        error => {
                            console.error(error);
                            alert('Produit introuvable');
                        }
                    );
                navigation.navigate('ProductDetail', { product: response.data.product });
            })
            .finally(() => setLoading(false));
    };

    if (hasPermission === null) {
        return <Text>Demande d'accès à la caméra</Text>;
    }
    if (hasPermission === false) {
        return <Text>Pas d'accès à la caméra</Text>;
    }

    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-end',
            }}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
            )}
        </View>
    );
}

export default Scan;
