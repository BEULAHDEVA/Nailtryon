import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screens/Home";
import HeaderTabs from './header/HeaderTabs';
import Account from "../screens/Account";
import Post from "../screens/Post";
import Links from "../screens/Links";
import LinkView from "../screens/LinkView";
import theme from "../styles/theme.style";
import SeeNails from "../screens/SeeNails";
import Saved from "../screens/Saved";
import { LogBox } from "react-native";
import Design from "../screens/Design";

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message

const Stack = createNativeStackNavigator();

const NavigationScreen = () => {
    return (
        <>
            <Stack.Navigator initialRouteName="Home" screenOptions={{
                animation: 'none',
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.primary_bg },
            }}>
                <Stack.Screen name="Home" component={Home} options={{ headerRight: () => <HeaderTabs /> }} />
                <Stack.Screen name="SeeNails" component={SeeNails} options={{
                    animationEnabled: false,
                    cardStyleInterpolator: () => null
                }} />
                <Stack.Screen name="Post" component={Post} />
                <Stack.Screen name="Account" component={Account} options={{
                    animationEnabled: false,
                    cardStyleInterpolator: () => null
                }} />
                <Stack.Screen name="Links" component={Links} />
                <Stack.Screen name="LinkView" component={LinkView} />
                <Stack.Screen name="Saved" component={Saved} />
                <Stack.Screen name="Design" component={Design} />
            </Stack.Navigator >
        </>
    )
}

export default NavigationScreen;