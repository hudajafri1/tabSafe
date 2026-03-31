import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
};

export default function PrimaryButton({
  title,
  onPress,
}: PrimaryButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: "#2B6CB0",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  text: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});