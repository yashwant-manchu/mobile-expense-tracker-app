import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  View,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";

const Login = () => {
  const { login, register, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    clearError();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => clearError();
  }, [isLogin]);

  useEffect(() => {
    if (error) {
    }
  }, [error]);

  const validateLoginInputs = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Password is required");
      return false;
    }
    return true;
  };

  const validateRegisterInputs = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Password is required");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return false;
    }
    return true;
  };

  const handleAuth = async () => {
    if (isLogin) {
      if (!validateLoginInputs()) return;
      await login(email, password);
    } else {
      if (!validateRegisterInputs()) return;
      await register(email, password, displayName || undefined);
    }
  };

  const toggleMode = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setPassword("");
      setConfirmPassword("");
      setIsLogin(!isLogin);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderLoginForm = () => (
    <>
      <View className="w-11/12">
        <TextInput
          className="w-full h-16 px-4 my-2 placeholder-gray-400 border shadow-sm bg-darkerGray border-accent text-light rounded-2xl"
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
      </View>
      <View className="w-11/12">
        <View className="flex-row items-center h-16 px-4 my-2 border shadow-sm bg-darkerGray border-accent rounded-2xl">
          <TextInput
            className="flex-1 placeholder-gray-400 text-light"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#00ADB5"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        className="items-center justify-center w-4/12 py-3 my-2 rounded-full shadow-sm bg-accent"
        onPress={handleAuth}
        disabled={loading}
      >
        <Text className="text-lg font-semibold text-dark">Login</Text>
      </TouchableOpacity>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <View className="w-11/12">
        <TextInput
          className="w-full h-16 px-4 my-2 placeholder-gray-400 border shadow-sm bg-darkerGray border-accent text-light rounded-2xl"
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
      </View>
      <View className="w-11/12">
        <TextInput
          className="w-full h-16 px-4 my-2 placeholder-gray-400 border shadow-sm bg-darkerGray border-accent text-light rounded-2xl"
          placeholder="Display Name (optional)"
          placeholderTextColor="#9CA3AF"
          value={displayName}
          onChangeText={setDisplayName}
          editable={!loading}
        />
      </View>
      <View className="w-11/12">
        <View className="flex-row items-center h-16 px-4 my-2 border shadow-sm bg-darkerGray border-accent rounded-2xl">
          <TextInput
            className="flex-1 placeholder-gray-400 text-light"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#00ADB5"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View className="w-11/12">
        <View className="flex-row items-center h-16 px-4 my-2 border shadow-sm bg-darkerGray border-accent rounded-2xl">
          <TextInput
            className="flex-1 placeholder-gray-400 text-light"
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
        </View>
      </View>

      <TouchableOpacity
        className="items-center justify-center w-4/12 py-3 my-2 rounded-full shadow-sm bg-accent"
        onPress={handleAuth}
        disabled={loading}
      >
        <Text className="text-lg font-semibold text-dark">Sign Up</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <SafeAreaView className="items-center justify-center flex-1 bg-dark">
          {loading && (
            <View className="absolute inset-0 z-50 items-center justify-center bg-black bg-opacity-50">
              <ActivityIndicator size="large" color="#00ADB5" />
            </View>
          )}

          <Animated.View
            style={{ opacity: fadeAnim }}
            className="items-center justify-center w-full"
          >
            <Text className="mb-8 text-4xl font-bold text-light">
              {isLogin ? "Login" : "Sign Up"}
            </Text>

            {isLogin ? renderLoginForm() : renderRegisterForm()}

            <Text onPress={toggleMode} className="mt-4 text-accent">
              {isLogin
                ? "Create new account"
                : "Already have an account? Login"}
            </Text>

            {error ? (
              <View className="px-4 py-2 mt-4 bg-red-500 rounded-md bg-opacity-20">
                <Text className="text-red-300">{error}</Text>
              </View>
            ) : null}
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Login;
