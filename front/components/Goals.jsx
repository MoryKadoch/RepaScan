import React, { useState, useEffect, useContext } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import UserContext from '../contexts/UserContext';

const Goals = () => {
    const { user } = useContext(UserContext);
    const [calories, setCalories] = useState("");
    const [currentWeight, setCurrentWeight] = useState("");
    const [goalWeight, setGoalWeight] = useState("");

    useFocusEffect(
        React.useCallback(() => {
            if (user) {
                //console.log(user);
                axios.get(API_BASE_URL + '/user/' + user.id, {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                    }
                })
                    .then(response => {
                        if (response.data && response.data.goals) {
                            setCalories(response.data.goals.calories);
                            setGoalWeight(response.data.goals.weightGoal);
                            const lastWeightRecord = response.data.goals.weightRecords.slice(-1)[0];
                            if (lastWeightRecord) setCurrentWeight(lastWeightRecord.weight);
                        }
                    })
                    .catch(error => console.error(error));
            }
        }, [user]));

        const handleGoals = async () => {
            try {
                const updatedGoals = {
                    'goals.calories': calories,
                    'goals.weightGoal': goalWeight,
                };
        
                const newWeightRecord = {
                    date: new Date(),
                    weight: currentWeight
                };
        
                const responseGoals = await axios.put(API_BASE_URL + '/user/update/' + user.id, 
                    updatedGoals, 
                    {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
        
                const responseWeightRecord = await axios.put(API_BASE_URL + '/user/update/' + user.id, 
                    { 'goals.weightRecords': newWeightRecord }, 
                    {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
        
                if (responseGoals.data && responseWeightRecord.data) {
                    Alert.alert('Mise à jour réussie', 'Vos objectifs ont été mis à jour.');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Erreur', 'Une erreur s\'est produite pendant la mise à jour.');
            }
        };
        

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Calories journalières :</Text>
            <TextInput
                style={styles.input}
                onChangeText={setCalories}
                value={calories.toString()}
                placeholder="Entrez vos calories journalières"
                keyboardType="numeric"
            />
            <Text style={styles.label}>Poids actuel (kg) :</Text>
            <TextInput
                style={styles.input}
                onChangeText={setCurrentWeight}
                value={currentWeight}
                placeholder="Entrez votre poids actuel"
                keyboardType="numeric"
            />
            <Text style={styles.label}>Poids souhaité (kg) :</Text>
            <TextInput
                style={styles.input}
                onChangeText={setGoalWeight}
                value={goalWeight}
                placeholder="Entrez votre poids souhaité"
                keyboardType="numeric"
            />
            <Button title="Valider" onPress={handleGoals} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10,
    },
});

export default Goals;
