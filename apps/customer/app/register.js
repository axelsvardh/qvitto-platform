import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    await register(name, email, password);
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Namn" value={name} onChangeText={setName} style={styles.input}/>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input}/>
      <TextInput placeholder="Lösenord" secureTextEntry value={password} onChangeText={setPassword} style={styles.input}/>
      <Button title="Registrera" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:"center", padding:20 },
  input:{ borderWidth:1, padding:10, marginVertical:5 }
});
