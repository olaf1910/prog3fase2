import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { IconButton, ActivityIndicator, Text } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TarefasScreen from '../screens/TarefasScreen';
import PerfilScreen from '../screens/PerfilScreen';
import CriarTarefaScreen from '../screens/CriarTarefaScreen';
import EditarTarefaScreen from '../screens/EditarTarefaScreen';
import AtribuirTarefaScreen from '../screens/AtribuirTarefaScreen';
import AlterarPalavraPasseScreen from '../screens/AlterarPalavraPasseScreen';
import GerirUtilizadoresScreen from '../screens/GerirUtilizadoresScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          headerTitle: 'FeedzzTrab',
        }}
      />
    </Stack.Navigator>
  );
}

function TarefasStack() {
  const { utilizador } = useAuth();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ListaTarefas" 
        component={TarefasScreen}
        options={{
          headerTitle: 'Tarefas',
        }}
      />
      {utilizador?.funcao === 'gerente' && (
        <>
          <Stack.Screen 
            name="CriarTarefa" 
            component={CriarTarefaScreen}
            options={{
              headerTitle: 'Nova Tarefa',
            }}
          />
          <Stack.Screen 
            name="EditarTarefa" 
            component={EditarTarefaScreen}
            options={{
              headerTitle: 'Gerir Tarefa',
            }}
          />
        </>
      )}
      {utilizador?.funcao === 'lider_equipa' && (
        <Stack.Screen 
          name="AtribuirTarefa" 
          component={AtribuirTarefaScreen}
          options={{
            headerTitle: 'Atribuir Tarefa',
          }}
        />
      )}
    </Stack.Navigator>
  );
}

function UtilizadoresStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="GerirUtilizadores"
        component={GerirUtilizadoresScreen}
        options={{
          headerTitle: 'Gerir Utilizadores',
        }}
      />
    </Stack.Navigator>
  );
}

function PerfilStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          headerTitle: 'Perfil do Utilizador',
        }}
      />
      <Stack.Screen
        name="AlterarPalavraPasse"
        component={AlterarPalavraPasseScreen}
        options={{
          headerTitle: 'Alterar Palavra-passe',
        }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { utilizador } = useAuth();
  const isAdmin = utilizador?.funcao === 'admin';
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      
      {!isAdmin && (
        <Tab.Screen
          name="TarefasTab"
          component={TarefasStack}
          options={{
            tabBarLabel: 'Tarefas',
            tabBarIcon: ({ color, size }) => (
              <IconButton icon="format-list-bulleted" size={size} color={color} />
            ),
          }}
        />
      )}
      
      {isAdmin && (
        <Tab.Screen
          name="UtilizadoresTab"
          component={UtilizadoresStack}
          options={{
            tabBarLabel: 'Utilizadores',
            tabBarIcon: ({ color, size }) => (
              <IconButton icon="account-group" size={size} color={color} />
            ),
          }}
        />
      )}
      
      <Tab.Screen
        name="PerfilTab"
        component={PerfilStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { estaAutenticado, estaAVerificarToken } = useAuth();

  if (estaAVerificarToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>A carregar...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {estaAutenticado ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  }
});