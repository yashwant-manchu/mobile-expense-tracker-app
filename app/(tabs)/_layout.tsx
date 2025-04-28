import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const ElevatedTabIcon = ({ children }: any) => {
    return (
        <LinearGradient
            colors={['#00ADB5', '#222831']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                height: 64,
                width: 64,
                borderRadius: 32,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                bottom: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 3.5,
                elevation: 10,
            }}
        >
            {children}
        </LinearGradient>
    );
};

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#393E46',
                    borderRadius: 50,
                    marginHorizontal: 60,
                    marginBottom: 36,
                    height: 46,
                    position: 'absolute',
                    elevation: 5,
                },
                tabBarShowLabel: false,
            }}
        >
            {/* Home Screen */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name="home"
                            size={28}
                            color={focused ? '#00ADB5' : '#EEEEEE'}
                        />
                    ),
                }}
            />
            {/* Add Expense */}
            <Tabs.Screen
                name="addExpense"
                options={{
                    title: 'Add Expense',
                    tabBarIcon: () => (
                        <ElevatedTabIcon>
                            <Ionicons name="add" size={32} color="#EEEEEE" />
                        </ElevatedTabIcon>
                    ),
                }}
            />
            {/* Profile Screen */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name="person"
                            size={28}
                            color={focused ? '#00ADB5' : '#EEEEEE'}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
