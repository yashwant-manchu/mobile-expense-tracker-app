import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import moment from 'moment';
import { deleteExpense, Expense, fetchExpenses } from '../services/expenseService';

export default function HomeScreen() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [totalExpense, setTotalExpense] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        calculateTotal(expenses);
    }, [expenses]);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchData();
            }
            return () => {
            };
        }, [user])
    );

    const fetchData = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const fetchedExpenses = await fetchExpenses(user.uid);
            setExpenses(fetchedExpenses);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(id);
            await deleteExpense(id);
            setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== id));
        } catch (error) {
            console.error("Failed to delete expense:", error);
        } finally {
            setIsDeleting(null);
        }
    };

    const calculateTotal = (expenses: Expense[]): void => {
        const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        setTotalExpense(total);
    }

    const renderExpenseItem = ({ item }: { item: Expense }) => (
        <View className="flex-row items-center justify-between p-4 mb-4 shadow-md bg-darkerGray rounded-xl">
            <View>
                <Text className="text-lg font-semibold text-light">{item.title}</Text>
                <Text className="text-gray-400">{moment(item.date).format('MMM DD, YYYY')}</Text>
            </View>
            <View className="items-end">
                <Text className="font-bold text-accent">${parseFloat(item.amount.toString()).toFixed(2)}</Text>
                <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    className="mt-2"
                    disabled={isDeleting === item.id}
                >
                    {isDeleting === item.id ? (
                        <ActivityIndicator size="small" color="#EEEEEE" />
                    ) : (
                        <Ionicons name="trash-outline" size={20} color="#EEEEEE" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 p-4 bg-dark">
            <View className="flex-1 p-4 bg-dark">
                <View className="p-6 mb-6 shadow-lg bg-darkerGray rounded-2xl">
                    <Text className="mb-2 text-xl font-semibold text-light">Total Expense</Text>
                    <Text className="text-3xl font-bold text-accent">${totalExpense.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    className="flex-row items-center justify-center py-3 mb-6 rounded-full bg-accent"
                    onPress={() => router.push('/addExpense')}
                >
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text className="ml-2 text-lg font-medium text-light">Add Expense</Text>
                </TouchableOpacity>
                {isLoading ? (
                    <View className="items-center justify-center flex-1">
                        <ActivityIndicator size="large" color="#00ADB5" />
                    </View>
                ) : expenses.length === 0 ? (
                    <Text className="mt-8 text-center text-light">No expenses found.</Text>
                ) : (
                    <FlatList
                        data={expenses}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderExpenseItem}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}