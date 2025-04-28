import { useState } from 'react';
import { TouchableOpacity, Text, View, SafeAreaView, ActivityIndicator, Image, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import { invalidateCache } from '../services/expenseService';

const Profile = () => {
    const { user, logout, loading } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [profileImageError, setProfileImageError] = useState(false);

    const placeholderImage = "https://via.placeholder.com/100";

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);

            invalidateCache();

            await logout();

        } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("Logout Failed", "There was a problem logging out. Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleImageError = () => {
        setProfileImageError(true);
    };

    if (loading || !user) {
        return (
            <SafeAreaView className="items-center justify-center flex-1 bg-dark">
                <ActivityIndicator size="large" color="#00ADB5" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-dark">
            <View className="flex-1 p-4 bg-dark">
                <View className="items-center mb-6">
                    <Image
                        source={{
                            uri: profileImageError ? placeholderImage : (user.photoURL || placeholderImage),
                        }}
                        className="w-24 h-24 mb-4 border-4 rounded-full border-accent"
                        onError={handleImageError}
                    />
                    <Text className="text-3xl font-extrabold text-light">Your Profile</Text>
                </View>

                <View className="p-6 mb-6 shadow-lg bg-darkerGray rounded-2xl">
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-accent">Email Address</Text>
                        <Text className="mt-1 text-lg text-light">{user.email}</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-accent">Display Name</Text>
                        <Text className="mt-1 text-lg text-light">
                            {user.displayName || "Not provided"}
                        </Text>
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-accent">Account Created</Text>
                        <Text className="mt-1 text-lg text-light">
                            {user.metadata?.creationTime
                                ? new Date(user.metadata.creationTime).toLocaleDateString()
                                : "N/A"}
                        </Text>
                    </View>
                </View>

                <View className="items-center">
                    <TouchableOpacity
                        className="flex-row items-center justify-center w-1/2 py-4 rounded-full shadow-md bg-accent active:opacity-90"
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color="#222831" />
                        ) : (
                            <>
                                <Ionicons name="log-out-outline" size={20} color="#222831" className="mr-2" />
                                <Text className="text-lg font-semibold text-center text-dark">
                                    Sign Out
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Profile;