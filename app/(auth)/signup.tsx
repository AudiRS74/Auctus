import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function SignupScreen() {
  const { signUpWithEmail, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSignup() {
    const { error } = await signUpWithEmail(email, password);
    setMsg(error ? error.message : "Confirmation email sent!");
  }

  return (
    <View style={{ padding: 24 }}>
      <Text>Sign up to Auctus</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Sign up with Email" onPress={handleSignup} disabled={loading} />
      <Button title="Sign up with Google" onPress={signInWithGoogle} disabled={loading} />
      {msg ? <Text>{msg}</Text> : null}
    </View>
  );
}