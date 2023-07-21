import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button, Modal, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const ProductDetail = ({ route, navigation }) => {
    const { product } = route.params;
    const [productDetails, setProductDetails] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [consumedGrams, setConsumedGrams] = useState('');
    const [caloriesConsumed, setCaloriesConsumed] = useState(0);

    navigation.setOptions({
        title: product.product_name,
    });

    useEffect(() => {
        axios.get(`https://world.openfoodfacts.net/api/v2/product/${product.code}.json`)
            .then((response) => {
                setProductDetails(response.data.product);
            })
            .catch((error) => {
                console.error(error);
            });

        AsyncStorage.getItem('@caloriesConsumed')
            .then((value) => {
                if (value) {
                    console.log(value);
                    const data = JSON.parse(value);
                    const currentDayData = data.find(d => d.date === moment().format('YYYY-MM-DD'));
                    setCaloriesConsumed(currentDayData ? currentDayData.calories : 0);
                } else {
                    setCaloriesConsumed(0);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }, [product]);

    const handleValidateButtonPress = () => {
        alert('Produit ajouté à votre consommation du jour');
        const consumedCalories = productDetails.nutriments["energy-kcal_100g"] * (consumedGrams / 100);
        const totalCalories = caloriesConsumed + consumedCalories;
        console.log(caloriesConsumed);

        AsyncStorage.getItem('@caloriesConsumed')
            .then((value) => {
                const currentDate = moment().format('YYYY-MM-DD');
                let data = [];
                if (value) {
                    data = JSON.parse(value);
                }
                const currentDayData = data.find(d => d.date === currentDate);
                if (currentDayData) {
                    currentDayData.calories += consumedCalories;
                } else {
                    data.push({ date: currentDate, calories: consumedCalories });
                }

                AsyncStorage.setItem('@caloriesConsumed', JSON.stringify(data))
                    .then(() => {
                        setCaloriesConsumed(totalCalories);
                        setModalVisible(false);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            })
            .catch((error) => {
                console.error(error);
            });
    };

    if (!productDetails) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <Image
                    source={{ uri: productDetails.image_url }}
                    style={styles.productImage}
                />
                <Text style={styles.productDescription}>{productDetails.description || "Description non renseignée"}</Text>
                <Text style={styles.info}>Code-barres : {productDetails.code}</Text>
                <Text style={styles.info}>Marque : {productDetails.brands || "Marque non renseignée"}</Text>
                <Text style={styles.info}>Catégorie : {productDetails.categories || "Catégorie non renseignée"}</Text>
                <Text style={styles.info}>Ingrédients : {productDetails.ingredients_text || "Ingrédients non renseignés"}</Text>
                <Text style={styles.info}>Allergènes : {productDetails.allergens || "Allergènes non renseignés"}</Text>
                <Text style={styles.info}>Traces potentielles : {productDetails.traces || "Aucune trace potentielle renseignée"}</Text>
                {productDetails.nutriscore_grade && (
                    <Text style={styles.info}>Nutriscore : {productDetails.nutriscore_grade.toUpperCase()}</Text>
                ) || (
                        <Text style={styles.info}>Nutriscore : non renseigné</Text>
                    )}
                {productDetails.ecoscore_grade && (
                    <Text style={styles.info}>Eco-score : {productDetails.ecoscore_grade.toUpperCase()}</Text>
                ) || (
                        <Text style={styles.info}>Eco-score : non renseigné</Text>
                    )}
                {productDetails.nutriments && productDetails.nutriments["energy-kcal_100g"] && (
                    <>
                        <Text style={styles.info}>Energie (par 100g) : {productDetails.nutriments["energy-kcal_100g"]} kcal</Text>
                    </>
                ) || (
                        <Text style={styles.info}>Energie : non renseigné</Text>
                    )}
            </ScrollView>

            <View style={styles.floatingButton}>
                <Button title="Ajouter à ma consommation du jour" onPress={() => setModalVisible(true)} />
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Combien de grammes avez-vous consommé ?</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setConsumedGrams}
                            value={consumedGrams}
                            placeholder="Entrez la quantité en grammes"
                            keyboardType="numeric"
                        />
                        <View style={styles.buttonContainer}>
                            <Button title="Valider" onPress={handleValidateButtonPress} />
                            <Button title="Fermer" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    content: {
        marginBottom: 60,
    },
    productImage: {
        width: '100%',
        height: 200,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    productDescription: {
        fontSize: 16,
        marginTop: 10,
    },
    info: {
        fontSize: 16,
        marginTop: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        width: '80%',
        alignSelf: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 18
    },
    input: {
        height: 40,
        width: '100%',
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 4,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ProductDetail;