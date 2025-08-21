import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme, Card, List, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';

const CentroAyudaScreen: React.FC = () => {
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
    subtitle: {
      fontSize: 16,
      marginBottom: 30,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
      elevation: 2,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.colors.primary,
    },
    listItem: {
      paddingVertical: 8,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    listDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    divider: {
      marginVertical: 4,
      backgroundColor: theme.colors.outline,
    },
    contactSection: {
      marginTop: 20,
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    contactTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      color: theme.colors.onSurface,
      textAlign: 'center',
    },
    contactText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  const helpSections = [
    {
      title: 'Cómo Usar la App',
      items: [
        {
          title: 'Iniciar Sesión',
          description: 'Accede con tu usuario y contraseña del gimnasio',
          route: '/ayuda-login'
        },
        {
          title: 'Navegación',
          description: 'Mueve entre pantallas usando la barra inferior',
          route: '/ayuda-navegacion'
        },
        {
          title: 'Cambiar Tema',
          description: 'Alterna entre modo claro y oscuro en Ajustes',
          route: '/ayuda-tema'
        }
      ]
    },
    {
      title: 'Reservas y Clases',
      items: [
        {
          title: 'Reservar Clase',
          description: 'Selecciona una clase y confirma tu reserva',
          route: '/ayuda-reservas'
        },
        {
          title: 'Cancelar Reserva',
          description: 'Cancela tu reserva desde Mis Turnos',
          route: '/ayuda-cancelar'
        },
        {
          title: 'Historial',
          description: 'Revisa tus reservas anteriores y futuras',
          route: '/ayuda-historial'
        }
      ]
    },
    {
      title: 'Notificaciones',
      items: [
        {
          title: 'Configurar Alertas',
          description: 'Activa notificaciones en Ajustes',
          route: '/ayuda-notificaciones'
        },
        {
          title: 'Recordatorios',
          description: 'Recibe avisos antes de tus clases',
          route: '/ayuda-recordatorios'
        }
      ]
    },
    {
      title: 'Perfil y Cuenta',
      items: [
        {
          title: 'Editar Perfil',
          description: 'Actualiza tu información personal',
          route: '/ayuda-perfil'
        },
        {
          title: 'Cambiar Contraseña',
          description: 'Modifica tu contraseña de acceso',
          route: '/ayuda-password'
        },
        {
          title: 'Cerrar Sesión',
          description: 'Salir de tu cuenta de forma segura',
          route: '/ayuda-logout'
        }
      ]
    }
  ];

  const handleHelpItemPress = (route: string) => {
    // Por ahora solo navegamos a la pantalla principal
    // En el futuro se pueden implementar pantallas específicas
    router.push('/acercade' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Centro de Ayuda" showBackButton />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Centro de Ayuda</Text>
        <Text style={styles.subtitle}>
          Encuentra respuestas a las preguntas más frecuentes
        </Text>

        {/* Secciones de Ayuda */}
        {helpSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <List.Item
                    title={item.title}
                    description={item.description}
                    onPress={() => handleHelpItemPress(item.route)}
                    style={styles.listItem}
                    titleStyle={styles.listTitle}
                    descriptionStyle={styles.listDescription}
                    right={(props) => (
                      <List.Icon {...props} icon="chevron-right" />
                    )}
                  />
                  {itemIndex < section.items.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </Card.Content>
          </Card>
        ))}

        {/* Sección de Contacto */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>¿Necesitas Más Ayuda?</Text>
          <Text style={styles.contactText}>
            Si no encuentras la respuesta que buscas, no dudes en contactarnos directamente.
          </Text>
          <Text style={[styles.contactText, { marginTop: 10, fontWeight: 'bold' }]}>
            Email: extendvm@gmail.com{'\n'}
            Gimnasio: ROGER GYM{'\n'}
            Ubicación: Villa Nueva, Córdoba
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CentroAyudaScreen;
