import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { addMember, getMembers, addDevice, getDevices, deleteMember } from '../src/db/database';

interface TestResult {
  label: string;
  ok: boolean;
  detail: string;
}

export default function DbTestScreen() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    runTests().then(setResults).finally(() => setRunning(false));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>SQLite Smoke Test</Text>
      {running && <ActivityIndicator color="#DC2626" style={{ marginTop: 20 }} />}
      {results.map((r, i) => (
        <View key={i} style={[styles.row, r.ok ? styles.pass : styles.fail]}>
          <Text style={styles.label}>{r.ok ? '✅' : '❌'} {r.label}</Text>
          <Text style={styles.detail}>{r.detail}</Text>
        </View>
      ))}
      {!running && (
        <Text style={styles.summary}>
          {results.every(r => r.ok) ? '🎉 All tests passed' : '⚠️ Some tests failed — see above'}
        </Text>
      )}
    </ScrollView>
  );
}

async function runTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // 1. Add a member
  try {
    const member = await addMember({ name: 'Test User', color: '#4A90E2' });
    results.push({ label: 'Add household member', ok: member.id > 0, detail: `id=${member.id}, name=${member.name}` });

    // 2. Read members back
    const members = await getMembers();
    const found = members.find(m => m.id === member.id);
    results.push({ label: 'Read members', ok: !!found, detail: `${members.length} member(s) in DB` });

    // 3. Add a device
    const device = await addDevice({
      memberId: member.id,
      name: "Test iPhone",
      category: 'phone',
      ecosystem: 'apple',
      brand: 'Apple',
      model: 'iPhone 15',
      serialNumber: 'SN123456',
      imei: '012345678901234',
      photoPath: null,
      receiptPhotoPath: null,
      purchaseDate: '2024-01-01',
      purchasePrice: 1499,
      currency: 'AUD',
      notes: 'Test notes',
      finderEnabled: 'yes',
      carrierName: 'Telstra',
      status: 'home',
    });
    results.push({ label: 'Add device', ok: device.id > 0, detail: `id=${device.id}, name=${device.name}` });

    // 4. Read devices back
    const devices = await getDevices(member.id);
    results.push({ label: 'Read devices for member', ok: devices.length === 1, detail: `${devices.length} device(s)` });

    // 5. Check ecosystem stored correctly
    results.push({ label: 'Ecosystem stored correctly', ok: devices[0].ecosystem === 'apple', detail: devices[0].ecosystem });

    // 6. Cascade delete (delete member → devices gone)
    await deleteMember(member.id);
    const devicesAfter = await getDevices(member.id);
    results.push({ label: 'Cascade delete on member', ok: devicesAfter.length === 0, detail: `${devicesAfter.length} devices remain after member delete` });

  } catch (e: unknown) {
    results.push({ label: 'Unexpected error', ok: false, detail: String(e) });
  }

  return results;
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: '#111827' },
  row: { padding: 14, borderRadius: 10, marginBottom: 10 },
  pass: { backgroundColor: '#DCFCE7' },
  fail: { backgroundColor: '#FEE2E2' },
  label: { fontSize: 15, fontWeight: '600', color: '#111827' },
  detail: { fontSize: 13, color: '#374151', marginTop: 4 },
  summary: { marginTop: 20, fontSize: 17, fontWeight: '600', textAlign: 'center', color: '#111827' },
});
