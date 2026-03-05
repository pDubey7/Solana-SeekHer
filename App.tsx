import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WalletProvider } from '@context/WalletContext';
import { UserProvider } from '@context/UserContext';
import AppNavigator from '@navigation/AppNavigator';

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <StatusBar style="light" backgroundColor="#0A0A0F" />
                <WalletProvider>
                    <UserProvider>
                        <AppNavigator />
                    </UserProvider>
                </WalletProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
