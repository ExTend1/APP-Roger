import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';

const PoliticaPrivacidadScreen: React.FC = () => {
  const theme = useTheme();

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
    lastUpdated: {
      fontSize: 12,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 20,
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Política de Privacidad" showBackButton />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Política de Privacidad – App Roger</Text>
        
        <Text style={styles.lastUpdated}>
          Última actualización: 21 de agosto de 2025
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionText}>
            En esta Política de Privacidad se describe cómo se recopila, utiliza y protege la información personal de los usuarios que acceden a la aplicación del gimnasio (Roger).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Información que recopilamos</Text>
          <Text style={styles.sectionText}>
            La App puede recopilar los siguientes datos personales:
          </Text>
          <Text style={styles.listItem}>• Nombre completo</Text>
          <Text style={styles.listItem}>• DNI (Documento Nacional de Identidad)</Text>
          <Text style={styles.listItem}>• Correo electrónico</Text>
          <Text style={styles.listItem}>• Número de teléfono</Text>
          <Text style={styles.sectionText}>
            El registro de cuentas no es realizado por los usuarios, sino por el administrador del gimnasio, quien otorga acceso a la App.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Uso de la información</Text>
          <Text style={styles.sectionText}>
            La información se utiliza con los siguientes fines:
          </Text>
          <Text style={styles.listItem}>• Gestionar la inscripción de los usuarios a las clases del gimnasio.</Text>
          <Text style={styles.listItem}>• Verificar la identidad de los usuarios mediante DNI.</Text>
          <Text style={styles.listItem}>• Enviar notificaciones push recordatorias cuando falte 1 hora para una clase.</Text>
          <Text style={styles.listItem}>• Contactar al usuario en caso de información relevante (ej.: cambios de horarios).</Text>
          <Text style={styles.listItem}>• A futuro, enviar comunicaciones informativas al correo electrónico o al teléfono proporcionado.</Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Acceso y uso de APIs externas</Text>
          <Text style={styles.sectionText}>
            La App utiliza APIs internas y externas únicamente para:
          </Text>
          <Text style={styles.listItem}>• Registrar la asistencia y la inscripción a clases.</Text>
          <Text style={styles.listItem}>• Sincronizar los datos con el sistema de gestión del gimnasio, accesible solo por el administrador.</Text>
          <Text style={styles.sectionText}>
            Los datos no se comparten con terceros ajenos al gimnasio.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Almacenamiento y seguridad</Text>
          <Text style={styles.sectionText}>
            Los datos personales se almacenan en los servidores propios del gimnasio.
          </Text>
          <Text style={styles.listItem}>• Las contraseñas y credenciales se guardan de manera cifrada (hash).</Text>
          <Text style={styles.listItem}>• Todo acceso se realiza a través de conexiones seguras (HTTPS).</Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Derechos del usuario</Text>
          <Text style={styles.sectionText}>
            El usuario tiene derecho a:
          </Text>
          <Text style={styles.listItem}>• Acceder a la información personal que se haya registrado en el sistema.</Text>
          <Text style={styles.listItem}>• Solicitar la eliminación de su cuenta y sus datos personales.</Text>
          <Text style={styles.sectionText}>
            Para ejercer estos derechos, se puede contactar a: extendvm@gmail.com
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Menores de edad</Text>
          <Text style={styles.sectionText}>
            La App está dirigida a todo público y no contiene contenido restringido para menores.
            En caso de que un menor de edad utilice la App, se entiende que cuenta con la autorización de sus padres o tutores.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Publicidad y pagos</Text>
          <Text style={styles.sectionText}>
            La App no muestra anuncios de terceros.
          </Text>
          <Text style={styles.sectionText}>
            La App no incluye compras dentro de la aplicación ni pagos electrónicos.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Cambios en esta política</Text>
          <Text style={styles.sectionText}>
            Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento.
            Se notificará a los usuarios en caso de que se realicen cambios relevantes.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contacto</Text>
          <Text style={styles.sectionText}>
            Para consultas sobre privacidad o protección de datos, puede comunicarse con:
          </Text>
          <Text style={styles.listItem}>extendvm@gmail.com</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default PoliticaPrivacidadScreen;
