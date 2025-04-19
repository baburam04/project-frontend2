import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  Keyboard,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { setAuthToken } from "../services/api"; // Import from your api.js

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();

  // Validation rules
  const validate = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    Keyboard.dismiss();
    setIsSubmitting(true);
    
    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/login", { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      // Use the setAuthToken function from api.js
      await setAuthToken(response.data.token);
      
      // Clear form and navigate
      setEmail("");
      setPassword("");
      navigation.navigate("Checklists");
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Network error - please check your connection";
      }
      
      Alert.alert("Login Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container} accessibilityLabel="Login screen">
      <Text style={styles.title}>Sticky Notes</Text>
      
      {/* Email Input */}
      <View>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          onBlur={() => handleBlur("email")}
          style={[
            styles.input,
            touched.email && errors.email && styles.inputError
          ]}
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          accessibilityLabel="Email input"
          accessibilityHint="Enter your email address"
          importantForAutofill="yes"
          id="loginEmailInput"
          name="loginEmail"
        />
        {touched.email && errors.email && (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.email}
          </Text>
        )}
      </View>
      
      {/* Password Input */}
      <View>
        <View style={[
          styles.passwordContainer,
          touched.password && errors.password && styles.inputError
        ]}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => handleBlur("password")}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            placeholderTextColor="#888"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            accessibilityLabel="Password input"
            accessibilityHint="Enter your password"
            importantForAutofill="yes"
            id="loginPasswordInput"
            name="loginPassword"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)} 
            style={styles.showPasswordButton}
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Text style={styles.showPasswordText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
        {touched.password && errors.password && (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.password}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.loginButton,
          (Object.keys(errors).length > 0 || isSubmitting) && styles.disabledButton
        ]} 
        onPress={handleLogin}
        disabled={Object.keys(errors).length > 0 || isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={isSubmitting ? "Logging in" : "Login button"}
        accessibilityState={{ disabled: isSubmitting || Object.keys(errors).length > 0 }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate("Register")}
        accessibilityRole="button"
        accessibilityLabel="Navigate to sign up screen"
      >
        <Text style={styles.link}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
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
    backgroundColor: "#fff",
    color: "#333",
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
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: "#333",
  },
  showPasswordButton: {
    padding: 12,
  },
  showPasswordText: {
    color: "#388E3C",
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#81C784",
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
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
});