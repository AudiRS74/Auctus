import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function SigninScreen() {
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSignin() {
    const { error } = await signInWithEmail(email, password);
    setMsg(error ? error.message : "");
  }

  return (
    <View style={{ padding: 24 }}>
      <Text>Sign in to Auctus</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Sign in with Email" onPress={handleSignin} disabled={loading} />
      <Button title="Sign in with Google" onPress={signInWithGoogle} disabled={loading} />
      {msg ? <Text>{msg}</Text> : null}
    </View>
  );
}