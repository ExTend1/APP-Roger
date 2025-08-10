import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import SwipeNavigator from './SwipeNavigator';

// Pantallas de ejemplo
const HomeScreen = () => {
  const theme = useTheme();
  
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.primary }]}>
      <Text style={[styles.title, { color: theme.colors.onPrimary }]}>
        🏠 Pantalla de Inicio
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onPrimary }]}>
        Desliza hacia la izquierda para ir a Clases
      </Text>
    </View>
  );
};

const ClassesScreen = () => {
  const theme = useTheme();
  
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.secondary }]}>
      <Text style={[styles.title, { color: theme.colors.onSecondary }]}>
        🏋️ Pantalla de Clases
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSecondary }]}>
        Desliza hacia la izquierda para ir a Mis Turnos
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSecondary }]}>
        Desliza desde el borde derecho para volver a Inicio
      </Text>
    </View>
  );
};

const TurnosScreen = () => {
  const theme = useTheme();
  
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.tertiary }]}>
      <Text style={[styles.title, { color: theme.colors.onTertiary }]}>
        📅 Mis Turnos
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onTertiary }]}>
        Desliza hacia la izquierda para ir a Ajustes
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onTertiary }]}>
        Desliza desde el borde derecho para volver a Clases
      </Text>
    </View>
  );
};

const AjustesScreen = () => {
  const theme = useTheme();
  
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.error }]}>
      <Text style={[styles.title, { color: theme.colors.onError }]}>
        ⚙️ Ajustes
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onError }]}>
        Desliza desde el borde derecho para volver a Mis Turnos
      </Text>
    </View>
  );
};

export default function SwipeNavigatorExample() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();

  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    console.log('Nueva pantalla:', index);
  };

  const goToScreen = (index: number) => {
    // Esta función se puede usar para navegación programática
    setCurrentIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Indicador de pantalla actual */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerText, { color: theme.colors.onSurface }]}>
          Pantalla {currentIndex + 1} de 4
        </Text>
        
        {/* Botones de navegación rápida */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => goToScreen(0)}
          >
            <Text style={[styles.navButtonText, { color: theme.colors.onPrimary }]}>
              🏠
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: theme.colors.secondary }]}
            onPress={() => goToScreen(1)}
          >
            <Text style={[styles.navButtonText, { color: theme.colors.onSecondary }]}>
              🏋️
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: theme.colors.tertiary }]}
            onPress={() => goToScreen(2)}
          >
            <Text style={[styles.navButtonText, { color: theme.colors.onTertiary }]}>
              📅
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: theme.colors.error }]}
            onPress={() => goToScreen(3)}
          >
            <Text style={[styles.navButtonText, { color: theme.colors.onError }]}>
              ⚙️
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SwipeNavigator con las pantallas */}
      <SwipeNavigator
        initialIndex={currentIndex}
        screens={[
          <HomeScreen />,
          <ClassesScreen />,
          <TurnosScreen />,
          <AjustesScreen />
        ]}
        threshold={0.25}           // 25% del ancho para completar
        edgeHitWidth={24}          // 24px desde el borde para edge swipe
        onIndexChange={handleIndexChange}
        disableEdgeSwipe={false}   // Habilitar edge swipe
        animationDuration={300}    // Duración de animación
        springConfig={{
          damping: 20,             // Amortiguación del spring
          stiffness: 90            // Rigidez del spring
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 50, // Para SafeArea
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navButtonText: {
    fontSize: 20,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.9,
  },
});
