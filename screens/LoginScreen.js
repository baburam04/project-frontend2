import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      await AsyncStorage.setItem("token", response.data.token);
      navigation.navigate("Checklists");
    } catch (error) {
      Alert.alert("Login Failed", error.response?.data?.message || "An error occurred");
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sticky Notes</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#4CAF50"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          placeholderTextColor="#4CAF50"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
          <Text style={styles.showPasswordText}>{showPassword ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
        Don't have an account? Sign Up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#E8F5E9", // Light green theme
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2E7D32", // Dark green shade
  },
  input: {
    borderWidth: 1,
    borderColor: "#A5D6A7", // Light green border
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Transparent effect
    color: "#2E7D32",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A5D6A7",
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: "#2E7D32",
  },
  showPasswordButton: {
    padding: 12,
  },
  showPasswordText: {
    color: "#388E3C",
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "rgba(46, 125, 50, 0.85)", // Transparent green button
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    textAlign: "center",
    color: "#388E3C",
  },
});


