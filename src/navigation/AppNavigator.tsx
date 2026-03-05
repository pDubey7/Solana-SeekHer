import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';

import { useWallet } from '@context/WalletContext';
import { useUser } from '@context/UserContext';

import type { AuthStackParams, OnboardingStackParams, RootStackParams } from '@navigation/types';

// ─── Lazy screen imports ───────────────────────────────────────────────────────
import SplashScreen from '@screens/SplashScreen';
import ConnectWalletScreen from '@screens/ConnectWalletScreen';
import OnboardingScreen from '@screens/OnboardingScreen';
import TabNavigator from '@navigation/TabNavigator';
import ChatScreen from '@screens/ChatScreen';
import MatchCelebrationScreen from '@screens/MatchCelebrationScreen';

// ─── Stack creators ───────────────────────────────────────────────────────────

const AuthStack = createStackNavigator<AuthStackParams>();
const OnboardingStack = createStackNavigator<OnboardingStackParams>();
const Root = createStackNavigator<RootStackParams>();

// ─── Sub-stacks ───────────────────────────────────────────────────────────────

function AuthNavigator() {
    return (
        <AuthStack.Navigator
            screenOptions={{
                headerShown: false,
                ...TransitionPresets.FadeFromBottomAndroid,
                cardStyle: { backgroundColor: '#0A0A0F' },
            }}
        >
            <AuthStack.Screen name="Splash" component={SplashScreen} />
            <AuthStack.Screen name="ConnectWallet" component={ConnectWalletScreen} />
        </AuthStack.Navigator>
    );
}

function OnboardingNavigator() {
    return (
        <OnboardingStack.Navigator
            screenOptions={{
                headerShown: false,
                ...TransitionPresets.FadeFromBottomAndroid,
                cardStyle: { backgroundColor: '#0A0A0F' },
            }}
        >
            <OnboardingStack.Screen name="Onboarding" component={OnboardingScreen} />
        </OnboardingStack.Navigator>
    );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

import Animated, {
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    useSharedValue,
} from 'react-native-reanimated';

function LoadingScreen() {
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.3, { duration: 800 }),
                withTiming(1.0, { duration: 800 }),
            ),
            -1,
            false,
        );
    }, [opacity]);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#0A0A0F',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Animated.Text
                style={[
                    {
                        fontSize: 36,
                        fontWeight: '800',
                        color: '#9945FF',
                        letterSpacing: 2,
                    },
                    animStyle,
                ]}
            >
                SeekHer
            </Animated.Text>
        </View>
    );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

export default function AppNavigator() {
    const { connected, connecting } = useWallet();
    const { hasCompletedProfile, loading } = useUser();

    // Show loading while connecting wallet or loading user data
    if (connecting || loading) return <LoadingScreen />;

    return (
        <NavigationContainer>
            <Root.Navigator
                screenOptions={{
                    headerShown: false,
                    ...TransitionPresets.FadeFromBottomAndroid,
                    cardStyle: { backgroundColor: '#0A0A0F' },
                }}
            >
                {!connected ? (
                    /* Auth flow */
                    <Root.Screen name="Splash" component={AuthNavigator} />
                ) : !hasCompletedProfile ? (
                    /* Onboarding flow */
                    <Root.Screen name="Onboarding" component={OnboardingNavigator} />
                ) : (
                    /* Main app */
                    <>
                        <Root.Screen name="Swipe" component={TabNavigator} />
                        <Root.Screen name="Chat" component={ChatScreen} />
                        <Root.Screen name="MatchCelebration" component={MatchCelebrationScreen} />
                    </>
                )}
            </Root.Navigator>
        </NavigationContainer>
    );
}
