import { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, Alert, View, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { addExpense } from '../services/expenseService';

export default function AddExpenseScreen() {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };

    const handleConfirm = (selectedDate: Date) => {
        const formattedDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        setDate(formattedDate);
        hideDatePicker();
    };

    const handleAddExpense = async () => {
        if (!title || !amount || !date) {
            Alert.alert('Missing Information', 'Please fill all fields');
            return;
        }
        if (!user) {
            Alert.alert('Authentication Error', 'User is not authenticated');
            return;
        }

        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format');
            return;
        }

        const amountNumber = parseFloat(amount);
        if (isNaN(amountNumber)) {
            Alert.alert('Invalid Amount', 'Please enter a valid number for amount');
            return;
        }

        try {
            setIsSubmitting(true);

            const expense = {
                userId: user.uid,
                title,
                amount: amountNumber,
                date: dateObj,
            };

            await addExpense(expense);

            setTitle('');
            setAmount('');
            setDate('');

            router.push('/');
        } catch (error) {
            console.error('Error adding expense:', error);
            Alert.alert('Error', 'Failed to add expense. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-dark">
            <View className="flex-1 p-4 bg-dark">
                <Text className="mb-6 text-2xl font-semibold text-light">Add New Expense</Text>
                <TextInput
                    placeholder="Title"
                    placeholderTextColor="#aaa"
                    className="p-4 mb-4 bg-darkerGray text-light rounded-2xl"
                    value={title}
                    onChangeText={setTitle}
                    editable={!isSubmitting}
                />
                <TextInput
                    placeholder="Amount"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                    className="p-4 mb-4 bg-darkerGray text-light rounded-2xl"
                    value={amount}
                    onChangeText={setAmount}
                    editable={!isSubmitting}
                />
                <TouchableOpacity
                    onPress={showDatePicker}
                    className="p-4 mb-6 bg-darkerGray rounded-2xl"
                    disabled={isSubmitting}
                >
                    <Text className="text-light">
                        {date || 'Select Date'}
                    </Text>
                </TouchableOpacity>

                {/* Cross-platform date picker */}
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                    date={date ? new Date(date) : new Date()}
                    themeVariant="dark"
                    display={Platform.OS === 'ios' ? 'spinner' : undefined}
                />

                <TouchableOpacity
                    className="flex-row items-center justify-center py-4 rounded-full bg-accent"
                    onPress={handleAddExpense}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Ionicons name="save-outline" size={24} color="white" />
                            <Text className="ml-2 text-lg font-medium text-light">Save Expense</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}