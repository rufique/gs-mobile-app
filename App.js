import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, DefaultTheme, Text, IconButton } from 'react-native-paper';
import Login from './screens/Auth/Login';
import Shed from './screens/Shed';
import { NavigationContainer } from '@react-navigation/native';
import AuthProvider, { AuthContext } from './helpers/AuthContext';
import { View } from 'react-native';

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#006622'
  }
}

const AppStack = createNativeStackNavigator();

const AuthLoader = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Authenticating...</Text>
  </View>
)

const AppNavigation = () => {
  let { isLoggedIn, isAuthLoading, signOut } = React.useContext(AuthContext);

  if(isAuthLoading) return <AuthLoader/>

  return (
    <NavigationContainer>
      <AppStack.Navigator>
        {isLoggedIn
          ? <AppStack.Screen
            name="Shed"
            component={Shed}
            options={() => ({
              headerShadowVisible: false,
              headerRight: () => {
                return (
                  <IconButton icon="logout" onPress={signOut} />
                )
              }
            })}
          />
          : <AppStack.Screen
            name='Login'
            component={Login}
            options={{
              headerShown: false
            }}
          />
        }
      </AppStack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {


  return (
    <Provider theme={customTheme}>
      <AuthProvider>
        <AppNavigation/>
      </AuthProvider>
    </Provider>
  )
}

