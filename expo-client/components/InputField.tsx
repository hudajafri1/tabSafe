import React from "react";
import { TextInput, StyleSheet } from "react-native";

type InputFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

export default function InputField({
  value,
  onChangeText,
  placeholder,
}: InputFieldProps) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
});