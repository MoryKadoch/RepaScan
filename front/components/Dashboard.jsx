import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
import axios from 'axios';
import UserContext from '../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
    const { user } = useContext(UserContext);
    const [remainingCalories, setRemainingCalories] = useState(0);
    const [weightData, setWeightData] = useState([]);
    const [consumedCalories, setConsumedCalories] = useState(0);
    const [calories, setCalories] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);

    const getCalories = async () => {
        try {
            const value = await AsyncStorage.getItem('@caloriesConsumed');
            if (value) {
                const data = JSON.parse(value);
                const currentDayData = data.find(d => d.date === moment().format('YYYY-MM-DD'));
                setConsumedCalories(currentDayData ? currentDayData.calories : 0);
            } else {
                setConsumedCalories(0);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get(API_BASE_URL + '/user/' + user.id, {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                }
            });

            const userData = response.data;
            if (userData && userData.goals) {
                const weightRecords = userData.goals.weightRecords.map(record => parseInt(record.weight));
                setWeightData(weightRecords);
                setRemainingCalories(userData.goals.calories - consumedCalories);
                setCalories(userData.goals.calories);
                setDataLoaded(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (user && user.id) {
                getCalories();
                fetchUserData();
            }
        }, [user])
    );

    let maxDataPoint = Math.max(...weightData);
    if (maxDataPoint === -Infinity) {
        maxDataPoint = 0;
    }
    let minDataPoint = Math.min(...weightData);
    if (minDataPoint === Infinity) {
        minDataPoint = 0;
    }

    // Tentative de graphique à reprendre plus tard
    const dataPointsSvg = weightData.map((point, index) => {
        const x = (width / (weightData.length - 1)) * index;
        const y = ((point - minDataPoint) / (maxDataPoint - minDataPoint)) * height;
        return { x, y };
    });

    return (
        <View style={styles.container}>
            <Text style={styles.calories}>Calories restantes : {remainingCalories} kcal</Text>
            <Text style={styles.calories}>Calories consommées aujourd'hui : {consumedCalories} kcal</Text>
            <Text style={styles.calories}>Objectif calorique : {calories} kcal</Text>
            <Text style={styles.calories}>Poids actuel : {weightData.length > 0 ? weightData[weightData.length - 1] + ' kg' : 'À définir'}</Text>
            <Text style={styles.calories}>Poids le plus élevé : {maxDataPoint ? maxDataPoint + ' kg' : 'À définir'}</Text>
            <Text style={styles.calories}>Poids le plus bas : {minDataPoint ? minDataPoint + ' kg' : 'À définir'}</Text>
            <Button title="Modifier mes objectifs" onPress={() => navigation.navigate('Objectifs')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    calories: {
        fontSize: 18,
        marginBottom: 20,
    },
    graph: {
        marginTop: 20,
        borderRadius: 16,
    },
});

export default Dashboard;
