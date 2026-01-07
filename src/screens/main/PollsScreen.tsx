import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { spacing } from "../../theme/colors";
import type { PollsScreenProps } from "../../types/navigation";

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  endsAt: string;
  userVoted?: string;
}

export const PollsScreen: React.FC<PollsScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const PRIMARY = "#8B4513";

  useEffect(() => {
    // TODO: Fetch polls from Firestore
    setPolls([
      {
        id: "1",
        question: "What genre should we feature next month?",
        options: [
          { id: "a", text: "Science Fiction", votes: 45 },
          { id: "b", text: "Mystery & Thriller", votes: 32 },
          { id: "c", text: "Romance", votes: 28 },
          { id: "d", text: "Self-Help", votes: 15 },
        ],
        totalVotes: 120,
        endsAt: "2026-01-15",
      },
      {
        id: "2",
        question: "Which feature would you like to see next?",
        options: [
          { id: "a", text: "Audiobooks", votes: 89 },
          { id: "b", text: "Book Clubs", votes: 56 },
          { id: "c", text: "Reading Challenges", votes: 43 },
        ],
        totalVotes: 188,
        endsAt: "2026-01-20",
        userVoted: "a",
      },
    ]);
    setLoading(false);
  }, []);

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(
      polls.map((poll) => {
        if (poll.id === pollId && !poll.userVoted) {
          return {
            ...poll,
            options: poll.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            ),
            totalVotes: poll.totalVotes + 1,
            userVoted: optionId,
          };
        }
        return poll;
      })
    );
    // TODO: Save vote to Firestore
  };

  const renderPoll = ({ item }: { item: Poll }) => (
    <View style={[styles.pollCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.question, { color: colors.textPrimary }]}>
        {item.question}
      </Text>
      <Text style={[styles.endsAt, { color: colors.textMuted }]}>
        Ends: {item.endsAt}
      </Text>

      {item.options.map((option) => {
        const percentage =
          item.totalVotes > 0 ? (option.votes / item.totalVotes) * 100 : 0;
        const isSelected = item.userVoted === option.id;
        const hasVoted = !!item.userVoted;

        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              { borderColor: isSelected ? PRIMARY : colors.border },
            ]}
            onPress={() => !hasVoted && handleVote(item.id, option.id)}
            disabled={hasVoted}
          >
            {hasVoted && (
              <View
                style={[
                  styles.progressBar,
                  { width: `${percentage}%`, backgroundColor: PRIMARY + "30" },
                ]}
              />
            )}
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={PRIMARY} />
                )}
                <Text
                  style={[styles.optionText, { color: colors.textPrimary }]}
                >
                  {option.text}
                </Text>
              </View>
              {hasVoted && (
                <Text
                  style={[styles.percentage, { color: colors.textSecondary }]}
                >
                  {percentage.toFixed(0)}%
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      <Text style={[styles.voteCount, { color: colors.textMuted }]}>
        {item.totalVotes} votes
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Community Polls
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={polls}
        renderItem={renderPoll}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="bar-chart-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No active polls
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  list: { padding: spacing.lg, gap: spacing.lg },
  pollCard: { padding: spacing.lg, borderRadius: 16 },
  question: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  endsAt: { fontSize: 12, marginBottom: spacing.md },
  option: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  progressBar: { position: "absolute", top: 0, left: 0, bottom: 0 },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  optionText: { fontSize: 14 },
  percentage: { fontSize: 14, fontWeight: "500" },
  voteCount: { fontSize: 12, marginTop: spacing.sm, textAlign: "right" },
  emptyState: { alignItems: "center", padding: spacing.xxl },
  emptyText: { marginTop: spacing.md, fontSize: 14 },
});
