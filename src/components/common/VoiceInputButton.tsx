import React, { useState, useEffect, useRef } from "react";
import { TouchableOpacity, StyleSheet, Animated, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SCRIBD_ACCENT = "#E31226";

// Check if native module is available (not in Expo Go)
let ExpoSpeechRecognitionModule: any = null;
let isNativeModuleAvailable = false;

try {
  const speechRecognition = require("@jamsch/expo-speech-recognition");
  ExpoSpeechRecognitionModule = speechRecognition.ExpoSpeechRecognitionModule;
  isNativeModuleAvailable = ExpoSpeechRecognitionModule != null;
} catch (e) {
  console.log("Speech recognition module not available");
}

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
  colors: any;
  size?: number;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onResult,
  colors,
  size = 20,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation while recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // Setup speech recognition event listeners
  useEffect(() => {
    if (!isNativeModuleAvailable) return;

    const subscription = ExpoSpeechRecognitionModule.addListener(
      "result",
      (event: any) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0]?.transcript || "";
          if (transcript && event.isFinal) {
            onResult(transcript);
            setIsRecording(false);
          }
        }
      }
    );

    const endSubscription = ExpoSpeechRecognitionModule.addListener("end", () =>
      setIsRecording(false)
    );

    const errorSubscription = ExpoSpeechRecognitionModule.addListener(
      "error",
      (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error === "not-allowed") {
          Alert.alert(
            "Permission Denied",
            "Please allow microphone access to use voice input."
          );
        }
      }
    );

    return () => {
      subscription?.remove?.();
      endSubscription?.remove?.();
      errorSubscription?.remove?.();
    };
  }, [onResult]);

  const handlePress = async () => {
    if (!isNativeModuleAvailable) {
      Alert.alert(
        "Development Build Required",
        "Voice input requires a development build. Run 'npx expo prebuild' and rebuild the app to use this feature.",
        [{ text: "OK" }]
      );
      return;
    }

    if (isRecording) {
      ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
      return;
    }

    try {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert(
          "Permission Required",
          "Microphone permission is required for voice input."
        );
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: false,
        maxAlternatives: 1,
        continuous: false,
      });
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      Alert.alert("Error", "Failed to start voice input. Please try again.");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        isRecording && styles.buttonRecording,
        { backgroundColor: isRecording ? SCRIBD_ACCENT : colors.surface },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Ionicons
          name={isRecording ? "mic" : "mic-outline"}
          size={size}
          color={isRecording ? "#FFFFFF" : colors.textMuted}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRecording: {
    shadowColor: "#E31226",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
