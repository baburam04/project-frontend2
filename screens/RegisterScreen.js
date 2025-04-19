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
import { useNavigation } from "@react-navigation/native";
import { setAuthToken } from "../services/api";
import api from "../services/api";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();

  // Validation rules
  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Needs at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Needs at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Needs at least one number";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = "Needs at least one special character";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validate();
    }
  }, [name, email, password, confirmPassword, touched]);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    setIsSubmitting(true);
    
    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/register", { 
        name: name.trim(),
        email: email.trim().toLowerCase(), 
        password 
      });
      
      // Automatically log in user after registration
      await setAuthToken(response.data.token);
      
      Alert.alert(
        "Registration Successful", 
        "Your account has been created!",
        [{ text: "OK", onPress: () => navigation.navigate("Checklists") }]
      );
      
      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response) {
        if (error.response.status === 400 && error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 409) {
          errorMessage = "Email already exists";
        }
      } else if (error.request) {
        errorMessage = "Network error - please check your connection";
      }
      
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container} accessibilityLabel="Registration screen">
      <Text style={styles.title}>Create an Account</Text>
      
      {/* Name Input */}
      <View>
        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          onBlur={() => handleBlur("name")}
          style={[
            styles.input,
            touched.name && errors.name && styles.inputError
          ]}
          placeholderTextColor="#888"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          accessibilityLabel="Full name input"
          accessibilityHint="Enter your full name"
          importantForAutofill="yes"
          id="registerNameInput"
          name="registerName"
        />
        {touched.name && errors.name && (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.name}
          </Text>
        )}
      </View>
      
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
          autoComplete="email"
          textContentType="emailAddress"
          accessibilityLabel="Email input"
          accessibilityHint="Enter your email address"
          importantForAutofill="yes"
          id="registerEmailInput"
          name="registerEmail"
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
            autoComplete="password-new"
            textContentType="newPassword"
            accessibilityLabel="Password input"
            accessibilityHint="Enter a password with at least 8 characters, including uppercase, lowercase, number, and special character"
            importantForAutofill="yes"
            id="registerPasswordInput"
            name="registerPassword"
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
      
      {/* Confirm Password Input */}
      <View>
        <View style={[
          styles.passwordContainer,
          touched.confirmPassword && errors.confirmPassword && styles.inputError
        ]}>
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => handleBlur("confirmPassword")}
            secureTextEntry={!showConfirmPassword}
            style={styles.passwordInput}
            placeholderTextColor="#888"
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            accessibilityLabel="Confirm password input"
            accessibilityHint="Re-enter your password to confirm"
            importantForAutofill="yes"
            id="registerConfirmPasswordInput"
            name="registerConfirmPassword"
          />
          <TouchableOpacity 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
            style={styles.showPasswordButton}
            accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
          >
            <Text style={styles.showPasswordText}>
              {showConfirmPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
        {touched.confirmPassword && errors.confirmPassword && (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.confirmPassword}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.registerButton,
          (Object.keys(errors).length > 0 || isSubmitting) && styles.disabledButton
        ]} 
        onPress={handleRegister}
        disabled={Object.keys(errors).length > 0 || isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={isSubmitting ? "Processing registration" : "Register button"}
        accessibilityState={{ disabled: isSubmitting || Object.keys(errors).length > 0 }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Register</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate("Login")}
        accessibilityRole="button"
        accessibilityLabel="Navigate to login screen"
      >
        <Text style={styles.link}>
          Already have an account? Login
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
  registerButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#81C784",
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
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
});