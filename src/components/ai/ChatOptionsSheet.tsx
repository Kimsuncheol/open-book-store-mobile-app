import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing, typography, borderRadius } from "../../theme/colors";

const ANIMATION_DURATION = 220;

export interface ChatOptionItem {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface ChatOptionsSheetProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  actions: ChatOptionItem[];
  onClose: () => void;
  colors: any;
}

export const ChatOptionsSheet: React.FC<ChatOptionsSheetProps> = ({
  visible,
  title,
  subtitle,
  actions,
  onClose,
  colors,
}) => {
  const insets = useSafeAreaInsets();
  const [isRendered, setIsRendered] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(260);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.timing(progress, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setIsRendered(false);
    });
  }, [progress, visible]);

  const translateY = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [sheetHeight + insets.bottom, 0],
      }),
    [insets.bottom, progress, sheetHeight]
  );

  const overlayOpacity = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.4],
      }),
    [progress]
  );

  if (!isRendered) return null;

  const styles = createStyles(colors);

  return (
    <Modal transparent visible={isRendered} animationType="none">
      <View style={styles.modalRoot}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            style={[styles.overlay, { opacity: overlayOpacity }]}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: spacing.lg + insets.bottom,
              transform: [{ translateY }],
            },
          ]}
          onLayout={(event) => setSheetHeight(event.nativeEvent.layout.height)}
        >
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionRow}
                onPress={action.onPress}
              >
                {action.icon ? (
                  <Ionicons
                    name={action.icon}
                    size={18}
                    color={action.destructive ? colors.error : colors.textPrimary}
                    style={styles.actionIcon}
                  />
                ) : null}
                <Text
                  style={[
                    styles.actionLabel,
                    action.destructive && styles.actionLabelDestructive,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },
    overlay: {
      flex: 1,
      backgroundColor: "#000000",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    handle: {
      alignSelf: "center",
      width: 44,
      height: 4,
      borderRadius: 999,
      backgroundColor: colors.border,
      marginBottom: spacing.sm,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    headerText: {
      flex: 1,
      marginRight: spacing.md,
    },
    title: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.borderLight,
    },
    actions: {
      gap: spacing.sm,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
    },
    actionIcon: {
      marginRight: spacing.sm,
    },
    actionLabel: {
      ...typography.bodySmall,
      color: colors.textPrimary,
    },
    actionLabelDestructive: {
      color: colors.error,
    },
  });
