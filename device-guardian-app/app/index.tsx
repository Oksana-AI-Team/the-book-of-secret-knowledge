import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛡️ Device Guardian</Text>
      <Text style={styles.subtitle}>Step 1 scaffold — navigation + SQLite ready</Text>

      <TouchableOpacity style={styles.btnTest} onPress={() => router.push('/db-test')}>
        <Text style={styles.btnTestText}>Run DB smoke test →</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Step 2 will add full device registry CRUD.{'\n'}
        Approve this step first.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  btnTest: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  btnTestText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});
