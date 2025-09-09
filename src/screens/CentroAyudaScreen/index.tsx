import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';

const CentroAyudaScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

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
    expandedContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      marginTop: 8,
    },
    expandedText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 20,
    },
  });

  const helpSections = [
    {
      title: 'Cómo Usar la App',
      items: [
        {
          id: 'login',
          title: 'Iniciar Sesión',
          description: 'Accede con tu usuario y contraseña del gimnasio',
          content: 'Para iniciar sesión necesitas una cuenta del gimnasio. Si no tienes una, debes solicitarla en recepción o contactar al número del gimnasio. Una vez que tengas tu cuenta, ingresa tu email y contraseña en la pantalla de login.'
        },
        {
          id: 'navegacion',
          title: 'Navegación',
          description: 'Mueve entre pantallas usando la barra inferior',
          content: 'La app tiene 4 secciones principales:\n• Inicio: Ve las clases disponibles y próximas\n• Clases: Explora todas las clases del gimnasio\n• Mis Turnos: Gestiona tus reservas\n• Ajustes: Configura notificaciones y perfil'
        },
        {
          id: 'tema',
          title: 'Cambiar Tema',
          description: 'Alterna entre modo claro y oscuro en Ajustes',
          content: 'Ve a Ajustes > Apariencia y activa/desactiva el "Modo oscuro" según tu preferencia. El cambio se aplica inmediatamente en toda la aplicación.'
        }
      ]
    },
    {
      title: 'Reservas y Clases',
      items: [
        {
          id: 'reservas',
          title: 'Reservar Clase',
          description: 'Selecciona una clase y confirma tu reserva',
          content: '1. Ve a la pestaña "Clases"\n2. Selecciona la clase que te interesa\n3. Toca "Reservar" y confirma\n4. Recibirás una notificación de confirmación\n5. Ve a "Mis Turnos" para ver tu reserva'
        },
        {
          id: 'cancelar',
          title: 'Cancelar Reserva',
          description: 'Cancela tu reserva desde Mis Turnos',
          content: '1. Ve a la pestaña "Mis Turnos"\n2. Encuentra la reserva que quieres cancelar\n3. Toca "Cancelar" y confirma\n4. La clase quedará disponible para otros usuarios'
        },
        {
          id: 'historial',
          title: 'Historial',
          description: 'Revisa tus reservas anteriores y futuras',
          content: 'En "Mis Turnos" puedes ver:\n• Próximas clases reservadas\n• Clases pasadas que asististe\n• Estado de cada reserva\n• Horarios y tipos de clase'
        }
      ]
    },
    {
      title: 'Notificaciones',
      items: [
        {
          id: 'notificaciones',
          title: 'Configurar Alertas',
          description: 'Activa notificaciones en Ajustes',
          content: '1. Ve a Ajustes > Notificaciones\n2. Activa "Notificaciones push"\n3. Acepta los permisos cuando se soliciten\n4. Recibirás recordatorios 1 hora antes de tus clases'
        },
        {
          id: 'recordatorios',
          title: 'Recordatorios',
          description: 'Recibe avisos antes de tus clases',
          content: 'Las notificaciones incluyen:\n• Recordatorio 1 hora antes de la clase\n• Confirmación al reservar\n• Aviso al cancelar una reserva\n• Información importante del gimnasio'
        }
      ]
    },
    {
      title: 'Perfil y Cuenta',
      items: [
        {
          id: 'perfil',
          title: 'Editar Perfil',
          description: 'Actualiza tu información personal',
          content: '1. Ve a Ajustes > Cuenta > Perfil\n2. Modifica tu información personal\n3. Toca "Guardar" para confirmar\n4. Los cambios se aplicarán inmediatamente'
        },
        {
          id: 'olvido-password',
          title: 'Olvidé mi Contraseña',
          description: '¿Qué hacer si no recuerdas tu contraseña?',
          content: 'Si olvidaste tu contraseña, debes contactar al gimnasio para que te ayuden a restablecerla:\n\n📞 WhatsApp: +54 9 353 565-1758\n📧 Email: extendvm@gmail.com\n📍 Ve personalmente a recepción\n\nEl personal del gimnasio verificará tu identidad y te ayudará a crear una nueva contraseña.'
        },
        {
          id: 'logout',
          title: 'Cerrar Sesión',
          description: 'Salir de tu cuenta de forma segura',
          content: '1. Ve a Ajustes > Cuenta\n2. Toca "Cerrar sesión"\n3. Confirma la acción\n4. Serás redirigido a la pantalla de login\n5. Tu sesión se cerrará de forma segura'
        }
      ]
    },
    {
      title: 'Roger Tokens',
      items: [
        {
          id: 'que-son-tokens',
          title: '¿Qué son los Roger Tokens?',
          description: 'Sistema de acceso a clases del gimnasio',
          content: 'Los Roger Tokens son tokens que te da el gimnasio según el plan que tengas contratado. Son necesarios para acceder a las clases del gimnasio. Sin tokens, no puedes reservar ni asistir a las clases.'
        },
        {
          id: 'como-obtener-tokens',
          title: '¿Cómo obtengo Tokens?',
          description: 'Según tu plan de pago',
          content: 'Los Roger Tokens se te otorgan automáticamente según el plan que tengas contratado:\n\n• Plan Básico: X tokens por mes\n• Plan Intermedio: Y tokens por mes\n• Plan Premium: Z tokens por mes\n\nLos tokens se renuevan cada mes con tu pago de cuota.'
        },
        {
          id: 'usar-tokens',
          title: '¿Cómo usar los Tokens?',
          description: 'Para acceder a las clases',
          content: 'Para reservar una clase:\n\n1. Ve a la sección "Clases"\n2. Selecciona la clase que quieres\n3. El sistema verificará que tengas tokens suficientes\n4. Confirma la reserva\n5. Se descontará 1 token de tu saldo\n\nCada clase cuesta 1 Roger Token.'
        },
        {
          id: 'ver-tokens',
          title: '¿Dónde veo mis Tokens?',
          description: 'Consultar tu saldo disponible',
          content: 'Puedes ver tu saldo de Roger Tokens en:\n\n• Tu perfil de usuario\n• La pantalla principal de la app\n• Al intentar reservar una clase\n• Recibes notificaciones cuando se renuevan\n\nEl saldo se actualiza automáticamente con tu pago mensual.'
        },
        {
          id: 'sin-tokens',
          title: '¿Qué pasa si no tengo Tokens?',
          description: 'Sin tokens no puedes acceder a clases',
          content: 'Si no tienes Roger Tokens disponibles:\n\n• No podrás reservar nuevas clases\n• Debes esperar a que se renueven con tu pago mensual\n• Contacta al gimnasio si tienes problemas con tu plan\n• Verifica que tu cuota esté al día\n\n📞 Contacto: +54 9 353 565-1758'
        }
      ]
    }
  ];

  const handleHelpItemPress = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
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
                    onPress={() => handleHelpItemPress(item.id)}
                    style={styles.listItem}
                    titleStyle={styles.listTitle}
                    descriptionStyle={styles.listDescription}
                    right={(props) => (
                      <List.Icon 
                        {...props} 
                        icon={expandedItems[item.id] ? "chevron-up" : "chevron-down"} 
                      />
                    )}
                  />
                  {expandedItems[item.id] && (
                    <View style={styles.expandedContent}>
                      <Text style={styles.expandedText}>{item.content}</Text>
                    </View>
                  )}
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
            📞 WhatsApp: +54 9 353 565-1758{'\n'}
            📧 Email: extendvm@gmail.com{'\n'}
            🏢 Gimnasio: ROGER GYM{'\n'}
            📍 Ubicación: Villa Nueva, Córdoba
          </Text>
          <Text style={[styles.contactText, { marginTop: 15, fontStyle: 'italic' }]}>
            También puedes acercarte personalmente a recepción para obtener tu cuenta o resolver cualquier consulta.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CentroAyudaScreen;
