import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type SendState = "idle" | "sending" | "streaming" | "stopping";

export default function MavisTab() {
  const stopRequestedRef = useRef(false);
  const activeRunIdRef = useRef<string | null>(null);

  const [sendState, setSendState] = useState<SendState>("idle");

  const canStop = useMemo(() => sendState === "sending" || sendState === "streaming", [sendState]);

  function requestStop() {
    stopRequestedRef.current = true;
    setSendState("stopping");
    // TODO: wire this to your streaming/abort logic
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MAVIS</Text>

      <Text style={styles.label}>Send state: {sendState}</Text>
      <Text style={styles.label}>Active run: {activeRunIdRef.current ?? "(none)"}</Text>

      <Pressable
        onPress={requestStop}
        disabled={!canStop}
        style={[styles.button, !canStop && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Stop</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  label: { fontSize: 14, marginBottom: 8, textAlign: "center" },
  button: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
