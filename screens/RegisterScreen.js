import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import api from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false
  });

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
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one special character";
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate on input change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validate();
    }
  }, [email, password, confirmPassword, touched]);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  const handleRegister = async () => {
    const isValid = validate();
    if (!isValid) return;

    try {
      await api.post("/api/auth/register", { email, password });
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Registration Failed", error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>
      
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
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
            <Text style={styles.showPasswordText}>{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>
        {touched.password && errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>
      
      {/* Confirm Password Input */}
      <View>
        <View style={[
          styles.passwordContainer,
          touched.confirmPassword && errors.confirmPassword ? styles.inputError : null
        ]}>
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => handleBlur("confirmPassword")}
            secureTextEntry={!showConfirmPassword}
            style={styles.passwordInput}
            placeholderTextColor="#4CAF50"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showPasswordButton}>
            <Text style={styles.showPasswordText}>{showConfirmPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>
        {touched.confirmPassword && errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.registerButton,
          Object.keys(errors).length > 0 ? styles.disabledButton : null
        ]} 
        onPress={handleRegister}
        disabled={Object.keys(errors).length > 0}
      >
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
      
      <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
        Already have an account? Login
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
  registerButton: {
    backgroundColor: "rgba(46, 125, 50, 0.85)",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "rgba(46, 125, 50, 0.5)",
  },
  registerButtonText: {
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