import React from 'react';
import { View, Text } from 'react-native';

export default function MatchCelebrationScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#9945FF', fontSize: 24, fontWeight: '800' }}>It's a Match! 💜</Text>
        </View>
    );
}
