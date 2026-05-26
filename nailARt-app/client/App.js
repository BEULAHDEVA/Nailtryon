import React from 'react';
import Navigation from './components/Navigation';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
// import { Camera } from 'expo-camera';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();//Ignore all log notifications

// SplashScreen.preventAutoHideAsync()

export default function App() {
  return (
    // <NavigationContainer>
    //   <AuthProvider>
    //     <Stack.Navigator initialRouteName="Post" screenOptions={{ headerShown: false }}>
    //       {/* <Stack.Screen name="SignIn" component={SignIn} />
    //       <Stack.Screen name="SignUp" component={SignUp} />
    //       <Stack.Screen name="Home" component={Home} /> */}
    //       <Stack.Screen name="SeeNails" component={SeeNails} />
    //     </Stack.Navigator>
    //   </AuthProvider>
    // </NavigationContainer>

    <Navigation />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
