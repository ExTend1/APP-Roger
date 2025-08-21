import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';

const TerminosCondicionesScreen: React.FC = () => {
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
      <CustomHeader title="Términos y Condiciones" showBackButton />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Términos y Condiciones – App Gimnasio</Text>
        
        <Text style={styles.lastUpdated}>
          Última actualización: 21 de agosto de 2025
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionText}>
            Al acceder o utilizar la aplicación del gimnasio (Roger), el usuario acepta los presentes Términos y Condiciones de Uso. Si no está de acuerdo, debe abstenerse de utilizarla.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceso y uso de la App</Text>
          <Text style={styles.sectionText}>
            La App está destinada exclusivamente a clientes activos con membresía vigente en el gimnasio.
          </Text>
          <Text style={styles.sectionText}>
            Las cuentas de usuarios con membresía vencida o inactiva podrán ser suspendidas o deshabilitadas por el administrador.
          </Text>
          <Text style={styles.sectionText}>
            El usuario debe utilizar la App de manera responsable. Reservar una clase implica un compromiso de asistencia; no se recomienda cancelar reiteradamente reservas sin justificación.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Reservas de clases</Text>
          <Text style={styles.sectionText}>
            La reserva de clases se realiza a través de la App y otorga un token de asistencia.
          </Text>
          <Text style={styles.sectionText}>
            En caso de no asistir a la clase reservada, el usuario pierde el token sin posibilidad de recuperación.
          </Text>
          <Text style={styles.sectionText}>
            No existe un límite de reservas por persona, siempre sujeto a la disponibilidad de cupos.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Responsabilidad del gimnasio</Text>
          <Text style={styles.sectionText}>
            El gimnasio no se responsabiliza por lesiones, accidentes o problemas de salud derivados de la participación en actividades físicas.
          </Text>
          <Text style={styles.sectionText}>
            El usuario es responsable de asegurarse de que su condición física le permita realizar las actividades.
          </Text>
          <Text style={styles.sectionText}>
            El gimnasio podrá modificar horarios, clases o actividades sin previo aviso.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Membresía y pagos</Text>
          <Text style={styles.sectionText}>
            El uso de la App está vinculado a la membresía activa del gimnasio.
          </Text>
          <Text style={styles.sectionText}>
            En caso de falta de pago o suspensión de la membresía, el acceso a la App podrá ser restringido.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Suspensión o eliminación de cuentas</Text>
          <Text style={styles.sectionText}>
            El gimnasio se reserva el derecho de suspender o eliminar la cuenta de un usuario si:
          </Text>
          <Text style={styles.listItem}>• Utiliza la App con fines indebidos o fraudulentos.</Text>
          <Text style={styles.listItem}>• Intenta acceder a datos de otros usuarios sin autorización.</Text>
          <Text style={styles.listItem}>• Reincide en conductas que afecten el funcionamiento normal de la App o del gimnasio.</Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Datos personales</Text>
          <Text style={styles.sectionText}>
            El tratamiento de los datos personales se regula en la Política de Privacidad de la App.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Modificaciones</Text>
          <Text style={styles.sectionText}>
            El gimnasio podrá modificar estos Términos y Condiciones en cualquier momento.
            Las modificaciones entrarán en vigencia desde su publicación en la App o en el sitio web oficial del gimnasio.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Jurisdicción</Text>
          <Text style={styles.sectionText}>
            Estos Términos y Condiciones se rigen por las leyes de la República Argentina.
            Cualquier conflicto será resuelto en los tribunales competentes del país.
          </Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contacto</Text>
          <Text style={styles.sectionText}>
            Para consultas sobre estos Términos y Condiciones, puede comunicarse a:
          </Text>
          <Text style={styles.listItem}>extendvm@gmail.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TerminosCondicionesScreen;
