import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator, type BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useWallet } from '@context/WalletContext';
import { getUnreadMatchCount } from '@services/neon';
import type { TabParams } from '@navigation/types';

// ─── Screens ──────────────────────────────────────────────────────────────────
import SwipeScreen from '@screens/SwipeScreen';
import MatchesListScreen from '@screens/MatchesListScreen';
import EventsScreen from '@screens/EventsScreen';
import ProfileScreen from '@screens/ProfileScreen';

// ─── Colors ───────────────────────────────────────────────────────────────────
const ACTIVE_TINT = '#9945FF';
const INACTIVE_TINT = '#444455';
const TAB_BG = '#0D0D14';
const TAB_BORDER = '#1E1E2E';

// ─── Badge Component ──────────────────────────────────────────────────────────
function UnreadBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <View
            style={{
                position: 'absolute',
                top: -4,
                right: -6,
                backgroundColor: '#FF4560',
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 3,
            }}
        >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                {count > 99 ? '99+' : count}
            </Text>
        </View>
    );
}

// ─── Navigator ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<TabParams>();

export default function TabNavigator() {
    const { walletAddress } = useWallet();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnread = async () => {
        if (!walletAddress) return;
        try {
            const count = await getUnreadMatchCount(walletAddress);
            setUnreadCount(count);
        } catch {
            // Non-critical; swallow
        }
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }: { route: RouteProp<TabParams> }): BottomTabNavigationOptions => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: TAB_BG,
                    borderTopColor: TAB_BORDER,
                    borderTopWidth: 1,
                    height: 60,
                },
                tabBarActiveTintColor: ACTIVE_TINT,
                tabBarInactiveTintColor: INACTIVE_TINT,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                },
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => {
                    let iconName = 'flame';

                    if (route.name === 'Swipe') iconName = focused ? 'flame' : 'flame-outline';
                    if (route.name === 'MatchesList') iconName = focused ? 'heart' : 'heart-outline';
                    if (route.name === 'Events') iconName = focused ? 'calendar' : 'calendar-outline';
                    if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

                    if (route.name === 'MatchesList') {
                        return (
                            <View>
                                <Icon name={iconName} size={24} color={color} />
                                <UnreadBadge count={unreadCount} />
                            </View>
                        );
                    }

                    return <Icon name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Swipe"
                component={SwipeScreen}
                options={{ tabBarLabel: 'Discover' }}
            />
            <Tab.Screen
                name="MatchesList"
                component={MatchesListScreen}
                options={{ tabBarLabel: 'Matches' }}
                listeners={{ focus: fetchUnread }}
            />
            <Tab.Screen
                name="Events"
                component={EventsScreen}
                options={{ tabBarLabel: 'Events' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
}
