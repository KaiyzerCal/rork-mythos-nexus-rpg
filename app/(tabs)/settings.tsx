import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Calendar,
  Mail,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Server,
} from 'lucide-react-native';
import { useBackendSync } from '@/contexts/BackendSyncContext';
import { useGame } from '@/contexts/GameContext';

export default function SettingsScreen() {
  const { syncStatus, integrations, forceSync, checkIntegrationStatus, isLoading } = useBackendSync();
  const { gameState } = useGame();
  const [refreshing, setRefreshing] = useState(false);

  const handleForceSync = async () => {
    setRefreshing(true);
    try {
      await forceSync();
      Alert.alert('Sync Complete', 'Your data has been synced to the cloud.');
    } catch {
      Alert.alert('Sync Failed', 'Could not sync data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCheckIntegrations = async () => {
    setRefreshing(true);
    try {
      await checkIntegrationStatus();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>System Settings</Text>
          <Text style={styles.subtitle}>Backend & Integrations</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={20} color="#00D9FF" />
            <Text style={styles.sectionTitle}>Cloud Sync Status</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusIndicator}>
                {syncStatus.isOnline ? (
                  <Cloud size={24} color="#4ADE80" />
                ) : (
                  <CloudOff size={24} color="#EF4444" />
                )}
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Connection</Text>
                <Text style={[styles.statusValue, { color: syncStatus.isOnline ? '#4ADE80' : '#EF4444' }]}>
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statusRow}>
              <View style={styles.statusIndicator}>
                <Clock size={24} color="#A78BFA" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Last Synced</Text>
                <Text style={styles.statusValue}>{formatDate(syncStatus.lastSyncAt)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statusRow}>
              <View style={styles.statusIndicator}>
                {syncStatus.isSyncing ? (
                  <ActivityIndicator size="small" color="#00D9FF" />
                ) : syncStatus.syncError ? (
                  <XCircle size={24} color="#EF4444" />
                ) : (
                  <CheckCircle size={24} color="#4ADE80" />
                )}
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Sync Status</Text>
                <Text style={[
                  styles.statusValue,
                  { color: syncStatus.syncError ? '#EF4444' : syncStatus.isSyncing ? '#00D9FF' : '#4ADE80' }
                ]}>
                  {syncStatus.isSyncing ? 'Syncing...' : syncStatus.syncError ? 'Error' : 'Synced'}
                </Text>
              </View>
            </View>

            {syncStatus.pendingChanges > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.statusRow}>
                  <View style={styles.statusIndicator}>
                    <Zap size={24} color="#FBBF24" />
                  </View>
                  <View style={styles.statusInfo}>
                    <Text style={styles.statusLabel}>Pending Changes</Text>
                    <Text style={[styles.statusValue, { color: '#FBBF24' }]}>
                      {syncStatus.pendingChanges}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.syncButton, (isLoading || refreshing) && styles.syncButtonDisabled]}
            onPress={handleForceSync}
            disabled={isLoading || refreshing}
          >
            {(isLoading || refreshing) ? (
              <ActivityIndicator size="small" color="#0A0A0F" />
            ) : (
              <RefreshCw size={18} color="#0A0A0F" />
            )}
            <Text style={styles.syncButtonText}>
              {(isLoading || refreshing) ? 'Syncing...' : 'Force Sync Now'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Server size={20} color="#00D9FF" />
            <Text style={styles.sectionTitle}>External Integrations</Text>
          </View>

          <View style={styles.integrationCard}>
            <View style={styles.integrationRow}>
              <View style={styles.integrationIcon}>
                <View style={[styles.iconBg, { backgroundColor: '#4285F420' }]}>
                  <Shield size={20} color="#4285F4" />
                </View>
              </View>
              <View style={styles.integrationInfo}>
                <Text style={styles.integrationName}>Google Account</Text>
                <Text style={styles.integrationDesc}>OAuth authentication</Text>
              </View>
              <View style={[
                styles.integrationStatus,
                { backgroundColor: integrations.google ? '#4ADE8020' : '#6B728020' }
              ]}>
                <Text style={[
                  styles.integrationStatusText,
                  { color: integrations.google ? '#4ADE80' : '#6B7280' }
                ]}>
                  {integrations.google ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.integrationCard}>
            <View style={styles.integrationRow}>
              <View style={styles.integrationIcon}>
                <View style={[styles.iconBg, { backgroundColor: '#EA433520' }]}>
                  <Mail size={20} color="#EA4335" />
                </View>
              </View>
              <View style={styles.integrationInfo}>
                <Text style={styles.integrationName}>Gmail</Text>
                <Text style={styles.integrationDesc}>Email notifications & tracking</Text>
              </View>
              <View style={[
                styles.integrationStatus,
                { backgroundColor: integrations.gmail ? '#4ADE8020' : '#6B728020' }
              ]}>
                <Text style={[
                  styles.integrationStatusText,
                  { color: integrations.gmail ? '#4ADE80' : '#6B7280' }
                ]}>
                  {integrations.gmail ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.integrationCard}>
            <View style={styles.integrationRow}>
              <View style={styles.integrationIcon}>
                <View style={[styles.iconBg, { backgroundColor: '#34A85320' }]}>
                  <Calendar size={20} color="#34A853" />
                </View>
              </View>
              <View style={styles.integrationInfo}>
                <Text style={styles.integrationName}>Google Calendar</Text>
                <Text style={styles.integrationDesc}>Quest & task scheduling</Text>
              </View>
              <View style={[
                styles.integrationStatus,
                { backgroundColor: integrations.calendar ? '#4ADE8020' : '#6B728020' }
              ]}>
                <Text style={[
                  styles.integrationStatusText,
                  { color: integrations.calendar ? '#4ADE80' : '#6B7280' }
                ]}>
                  {integrations.calendar ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleCheckIntegrations}
            disabled={refreshing}
          >
            <RefreshCw size={16} color="#A78BFA" />
            <Text style={styles.refreshButtonText}>Refresh Integration Status</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={20} color="#00D9FF" />
            <Text style={styles.sectionTitle}>Data Overview</Text>
          </View>

          <View style={styles.dataGrid}>
            <View style={styles.dataItem}>
              <Text style={styles.dataValue}>{gameState.quests.length}</Text>
              <Text style={styles.dataLabel}>Quests</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataValue}>{gameState.skillTrees.length}</Text>
              <Text style={styles.dataLabel}>Skills</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataValue}>{gameState.tasks.length}</Text>
              <Text style={styles.dataLabel}>Tasks</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataValue}>{gameState.councils.length}</Text>
              <Text style={styles.dataLabel}>Council</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataValue}>{gameState.vaultEntries.length}</Text>
              <Text style={styles.dataLabel}>Vault Entries</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataValue}>{gameState.inventoryV2.length}</Text>
              <Text style={styles.dataLabel}>Inventory</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Backend Features</Text>
            <Text style={styles.infoText}>
              • Auto-sync game state every 3 seconds{'\n'}
              • Cloud backup of all quests, skills, and progress{'\n'}
              • Calendar integration for quest deadlines{'\n'}
              • Persistent memory across sessions{'\n'}
              • Council chat history storage
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  statusCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#2D2D3A',
    marginVertical: 8,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00D9FF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#0A0A0F',
  },
  integrationCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  integrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  integrationIcon: {
    marginRight: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  integrationInfo: {
    flex: 1,
  },
  integrationName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  integrationDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  integrationStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  integrationStatusText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
  },
  refreshButtonText: {
    fontSize: 13,
    color: '#A78BFA',
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  dataItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#00D9FF',
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#A78BFA',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});
