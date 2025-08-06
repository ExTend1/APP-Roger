import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Avatar,
  Card,
  Divider,
  useTheme,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../contexts/authStore';
import { userService } from '../../services/userService';

interface ProfileData {
  nombre: string;
  apellido: string;
  telefono: string;
  genero: string;
}

export default function ProfileEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  
  const [profileData, setProfileData] = useState<ProfileData>({
    nombre: '',
    apellido: '',
    telefono: '',
    genero: '',
  });

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    
    try {
      const response = await userService.getMyProfile();
      
      if (response.success && response.data) {
        setProfileData({
          nombre: response.data.nombre || '',
          apellido: response.data.apellido || '',
          telefono: response.data.telefono || '',
          genero: response.data.genero || '',
        });
      } else {
        showSnackbar(response.error || 'Error al cargar el perfil', 'error');
      }
    } catch (err) {
      showSnackbar('Error al cargar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!profileData.nombre.trim() || !profileData.apellido.trim()) {
      showSnackbar('Nombre y apellido son requeridos', 'error');
      return;
    }

    setSaving(true);

    try {
      const response = await userService.updateMyProfile({
        nombre: profileData.nombre.trim(),
        apellido: profileData.apellido.trim(),
        telefono: profileData.telefono.trim() || undefined,
        genero: profileData.genero.trim() || undefined,
      });

      if (response.success && response.data) {
        showSnackbar('Perfil actualizado correctamente', 'success');
        // Actualizar el usuario en el store
        updateUser(response.data);
        // Volver a la pantalla anterior después de un breve delay
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        showSnackbar(response.error || 'Error al actualizar el perfil', 'error');
      }
    } catch (err) {
      showSnackbar('Error al actualizar el perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const getInitials = () => {
    const nombre = profileData.nombre.charAt(0).toUpperCase();
    const apellido = profileData.apellido.charAt(0).toUpperCase();
    return nombre + apellido;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? "light" : "dark"} backgroundColor={theme.colors.surface} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Cargando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? "light" : "dark"} backgroundColor={theme.colors.surface} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Button
              icon="arrow-left"
              mode="text"
              onPress={() => router.back()}
              textColor={theme.colors.onBackground}
            >
              Cancelar
            </Button>
            <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
              Editar Perfil
            </Text>
            <Button
              mode="text"
              onPress={handleSubmit}
              disabled={saving}
              textColor={theme.colors.primary}
              loading={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </View>

          {/* Profile Picture Section */}
          <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.profileCardContent}>
              <View style={styles.avatarContainer}>
                <Avatar.Text
                  size={80}
                  label={getInitials()}
                  style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                  labelStyle={styles.avatarLabel}
                />
                <Button
                  mode="outlined"
                  icon="camera"
                  onPress={() => Alert.alert('Funcionalidad', 'Cambiar foto de perfil próximamente')}
                  style={styles.changePhotoButton}
                  textColor={theme.colors.primary}
                >
                  Cambiar foto
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Form Section */}
          <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Información Personal
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Nombre
                </Text>
                <TextInput
                  mode="outlined"
                  value={profileData.nombre}
                  onChangeText={(text) => handleInputChange('nombre', text)}
                  placeholder="Tu nombre"
                  style={styles.textInput}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Apellido
                </Text>
                <TextInput
                  mode="outlined"
                  value={profileData.apellido}
                  onChangeText={(text) => handleInputChange('apellido', text)}
                  placeholder="Tu apellido"
                  style={styles.textInput}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Teléfono
                </Text>
                <TextInput
                  mode="outlined"
                  value={profileData.telefono}
                  onChangeText={(text) => handleInputChange('telefono', text)}
                  placeholder="Tu número de teléfono"
                  keyboardType="phone-pad"
                  style={styles.textInput}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Género
                </Text>
                <View style={styles.genderContainer}>
                  {['masculino', 'femenino', 'otro'].map((gender) => (
                    <Button
                      key={gender}
                      mode={profileData.genero === gender ? 'contained' : 'outlined'}
                      onPress={() => handleInputChange('genero', gender)}
                      style={styles.genderButton}
                      textColor={
                        profileData.genero === gender 
                          ? theme.colors.onPrimary 
                          : theme.colors.primary
                      }
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Button>
                  ))}
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Read-only Information */}
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Información de Cuenta
              </Text>
              
              <View style={styles.infoRow}>
                <MaterialCommunityIcons 
                  name="email" 
                  size={20} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Email
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                    {user?.email || 'No disponible'}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons 
                  name="account-key" 
                  size={20} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Rol
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                    {user?.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={saving}
              loading={saving}
              style={styles.saveButton}
              contentStyle={styles.saveButtonContent}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => router.back()}
              disabled={saving}
              style={styles.cancelButton}
            >
              Cancelar
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          { 
            backgroundColor: snackbarType === 'success' 
              ? theme.colors.primary 
              : theme.colors.error 
          }
        ]}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  profileCardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    borderRadius: 20,
  },
  formCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    borderRadius: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 8,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    borderRadius: 12,
  },
  snackbar: {
    margin: 16,
  },
}); 