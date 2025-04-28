import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import Config from "../firebase/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { User, AuthError } from "firebase/auth";

const ERROR_MESSAGES: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already in use',
    'auth/weak-password': 'Password is too weak',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/operation-not-allowed': 'Operation not allowed',
};

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

type AuthContextType = {
    user: User | null;
    loading: boolean;
    error: string | null;
    authStatus: AuthStatus;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName?: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = 'auth_user';
const AUTH_PERSISTENCE_KEY = 'auth_persistence';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                }
            } catch (err) {
                console.error("Error retrieving stored user:", err);
            } finally {
                setIsInitialized(true);
            }
        };

        initAuth();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const unsubscribe = Config.auth.onAuthStateChanged(async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    setUser(firebaseUser);
                    setAuthStatus('authenticated');

                    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(firebaseUser));

                    await AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, 'true');
                } else {
                    setUser(null);
                    setAuthStatus('unauthenticated');

                    const persistAuth = await AsyncStorage.getItem(AUTH_PERSISTENCE_KEY);
                    if (persistAuth === 'true') {
                        await AsyncStorage.removeItem(USER_STORAGE_KEY);
                    }
                }
            } catch (err) {
                console.error("Auth state change error:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [isInitialized]);

    const processAuthError = (error: any): string => {
        console.error("Auth error:", error);

        if (error instanceof Error) {
            const errorCode = (error as AuthError).code;
            return ERROR_MESSAGES[errorCode] || error.message;
        }

        return 'An unexpected error occurred';
    };

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        clearError();

        try {
            const { user } = await Config.login(email, password);
            setUser(user);
            setAuthStatus('authenticated');
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            await AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, 'true');
        } catch (err: any) {
            setError(processAuthError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (email: string, password: string, displayName?: string) => {
        setLoading(true);
        clearError();

        try {
            const { user } = await Config.register(email, password);

            if (displayName && user) {
                await Config.updateProfile(user, { displayName });
            }

            setUser(user);
            setAuthStatus('authenticated');
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            await AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, 'true');
            router.replace('/(tabs)');
        } catch (err: any) {
            setError(processAuthError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        clearError();

        try {
            await Config.logout();
            setUser(null);
            setAuthStatus('unauthenticated');
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            router.replace('/auth/login');
        } catch (err: any) {
            setError(processAuthError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const contextValue = useMemo(() => ({
        user,
        loading,
        error,
        authStatus,
        login,
        register,
        logout,
        clearError,
    }), [user, loading, error, authStatus, login, register, logout, clearError]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};