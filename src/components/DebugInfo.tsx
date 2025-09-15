import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ENV_CONFIG } from '../config/environment';
import { authService } from '../services/authService';

interface DebugInfoProps {
  visible?: boolean;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ visible = false }) => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Ejecutando tests de debugging...');
      
      // Test 1: Configuración de entorno
      const envTest = {
        apiBaseUrl: ENV_CONFIG.API_BASE_URL,
        isDev: ENV_CONFIG.IS_DEV,
        isProduction: ENV_CONFIG.IS_PRODUCTION,
        hasExpoConfig: !!ENV_CONFIG.DEBUG_INFO.expoConfig,
        hasExtra: !!ENV_CONFIG.DEBUG_INFO.extra,
        extraKeys: ENV_CONFIG.DEBUG_INFO.extra ? Object.keys(ENV_CONFIG.DEBUG_INFO.extra) : [],
      };

      // Test 2: Conectividad
      const connectionTest = await authService.testConnection();

      // Test 3: Endpoint de login
      const loginEndpointTest = await authService.testLoginEndpoint();

      // Test 4: Test completo de API
      const fullApiTest = await authService.testApiCompletely();

      setTestResults({
        envTest,
        connectionTest,
        loginEndpointTest,
        fullApiTest,
        timestamp: new Date().toISOString(),
      });

      console.log('✅ Tests completados:', {
        envTest,
        connectionTest,
        loginEndpointTest,
        fullApiTest,
      });
    } catch (error) {
      console.error('❌ Error en tests:', error);
      setTestResults({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Debug Info</Text>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={runTests}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Ejecutando tests...' : 'Ejecutar Tests'}
        </Text>
      </TouchableOpacity>

      {testResults && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📊 Resultados:</Text>
          <Text style={styles.resultsText}>
            {JSON.stringify(testResults, null, 2)}
          </Text>
        </ScrollView>
      )}

      <View style={styles.configContainer}>
        <Text style={styles.configTitle}>⚙️ Configuración Actual:</Text>
        <Text style={styles.configText}>
          API URL: {ENV_CONFIG.API_BASE_URL}
        </Text>
        <Text style={styles.configText}>
          Entorno: {ENV_CONFIG.IS_DEV ? 'Desarrollo' : 'Producción'}
        </Text>
        <Text style={styles.configText}>
          Expo Config: {ENV_CONFIG.DEBUG_INFO.expoConfig ? 'Disponible' : 'No disponible'}
        </Text>
        <Text style={styles.configText}>
          Extra Keys: {ENV_CONFIG.DEBUG_INFO.extraKeys.join(', ')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
  },
  resultsTitle: {
    color: '#00FF00',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultsText: {
    color: '#00FF00',
    fontFamily: 'monospace',
    fontSize: 10,
  },
  configContainer: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
  },
  configTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  configText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default DebugInfo;

