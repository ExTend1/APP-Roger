import React from 'react';
import { ScrollView, StyleSheet, View, Linking } from 'react-native';
import { Text, useTheme, Divider, Card, List, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';

const AcercaDeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
      color: theme.colors.primary,
    },
    sectionText: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
      color: theme.colors.onBackground,
    },
    listItem: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 5,
      marginLeft: 15,
      color: theme.colors.onBackground,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
      elevation: 2,
    },
    versionContainer: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingBottom: 40,
    },
    versionText: {
      fontSize: 12,
      fontStyle: 'italic',
      color: theme.colors.onSurfaceVariant,
    },
  });

  const handleEmailContact = () => {
    Linking.openURL('mailto:extendvm@gmail.com');
  };

  const handleOpenPrivacyPolicy = () => {
    router.push('/politica-privacidad' as any);
  };

  const handleOpenTerms = () => {
    router.push('/terminos-condiciones' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Acerca de" showBackButton />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Acerca de – App Gimnasio</Text>

        {/* Sobre la App */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Sobre la App</Text>
            <Text style={styles.sectionText}>
              Esta aplicación fue desarrollada para los socios del gimnasio con el fin de:
            </Text>
            <Text style={styles.listItem}>• Consultar horarios de clases.</Text>
            <Text style={styles.listItem}>• Reservar cupos disponibles.</Text>
            <Text style={styles.listItem}>• Recibir notificaciones recordatorias antes de cada clase.</Text>
          </Card.Content>
        </Card>

        {/* Sobre el Gimnasio */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Sobre el Gimnasio</Text>
            <Text style={styles.sectionText}>
              <Text style={{ fontWeight: 'bold' }}>Nombre del Gimnasio:</Text> ROGER GYM
            </Text>
            <Text style={styles.sectionText}>
              <Text style={{ fontWeight: 'bold' }}>Ubicación:</Text> Villa Nueva, Córdoba
            </Text>
            <Text style={styles.sectionText}>
              <Text style={{ fontWeight: 'bold' }}>Email de contacto:</Text> extendvm@gmail.com
            </Text>
            <Button
              mode="outlined"
              onPress={handleEmailContact}
              style={{ marginTop: 10 }}
              icon="email"
            >
              Contactar por Email
            </Button>
          </Card.Content>
        </Card>

        {/* Documentos Legales */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Documentos Legales</Text>
            <List.Item
              title="Política de Privacidad"
              description="Cómo manejamos tu información"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleOpenPrivacyPolicy}
              style={{ paddingLeft: 0 }}
            />
            <Divider style={{ marginVertical: 8 }} />
            <List.Item
              title="Términos y Condiciones"
              description="Condiciones de uso de la app"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleOpenTerms}
              style={{ paddingLeft: 0 }}
            />
          </Card.Content>
        </Card>

        {/* Información Técnica */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Información Técnica</Text>
            <Text style={styles.sectionText}>
              <Text style={{ fontWeight: 'bold' }}>Desarrollador:</Text> ExTend System
            </Text>
            <Text style={styles.sectionText}>
              <Text style={{ fontWeight: 'bold' }}>Plataforma:</Text> React Native / Expo
            </Text>
            <Text style={styles.sectionText}>
              <Text style={{ fontWeight: 'bold' }}>Última actualización:</Text> 21 de agosto de 2025
            </Text>
          </Card.Content>
        </Card>

        {/* Versión */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Versión actual: 1.0.0
          </Text>
          <Text style={[styles.versionText, { marginTop: 5 }]}>
            © 2025 ROGER GYM. Todos los derechos reservados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AcercaDeScreen;
