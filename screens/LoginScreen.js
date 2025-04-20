import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules
  const validate = () => {
    const newErrors = {};
    
    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate on input change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validate();
    }
  }, [email, password, touched]);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  const handleLogin = async () => {
    setIsSubmitting(true);
    const isValid = validate();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/login", { email, password });
      await AsyncStorage.setItem("token", response.data.token);
      navigation.navigate("Checklists");
    } catch (error) {
      Alert.alert(
        "Login Failed", 
        error.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Online To-Do List</Text>
      
      {/* Email Input */}
      <View>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          onBlur={() => handleBlur("email")}
          style={[
            styles.input,
            touched.email && errors.email ? styles.inputError : null
          ]}
          placeholderTextColor="#4CAF50"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {touched.email && errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>
      
      {/* Password Input */}
      <View>
        <View style={[
          styles.passwordContainer,
          touched.password && errors.password ? styles.inputError : null
        ]}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => handleBlur("password")}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            placeholderTextColor="#4CAF50"
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)} 
            style={styles.showPasswordButton}
          >
            <Text style={styles.showPasswordText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
        {touched.password && errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.loginButton,
          (Object.keys(errors).length > 0 || isSubmitting) ? styles.disabledButton : null
        ]} 
        onPress={handleLogin}
        disabled={Object.keys(errors).length > 0 || isSubmitting}
      >
        <Text style={styles.loginButtonText}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Text>
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
    backgroundColor: "#E8F5E9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2E7D32",
  },
  input: {
    borderWidth: 1,
    borderColor: "#A5D6A7",
    padding: 12,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "#2E7D32",
  },
  inputError: {
    borderColor: "#f44336",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A5D6A7",
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginBottom: 5,
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
    backgroundColor: "rgba(46, 125, 50, 0.85)",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "rgba(46, 125, 50, 0.5)",
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
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
});