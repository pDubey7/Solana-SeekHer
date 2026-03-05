import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { User, NFT, Token, LookingFor } from '@app-types/index';

// ─── Stack Param Lists ────────────────────────────────────────────────────────

export type AuthStackParams = {
    Splash: undefined;
    ConnectWallet: undefined;
};

export type OnboardingStackParams = {
    Onboarding: undefined;
};

export type TabParams = {
    Swipe: undefined;
    MatchesList: undefined;
    Events: undefined;
    Profile: undefined;
};

export type RootStackParams = AuthStackParams &
    OnboardingStackParams &
    TabParams & {
        Chat: {
            matchId: string;
            matchedUser: User;
        };
        MatchCelebration: {
            matchId: string;
            matchedUser: User;
            compatibilityScore: number;
            sharedNfts: NFT[];
            sharedTokens: Token[];
            sharedTags: string[];
            mode: LookingFor;
        };
    };

// ─── Typed Hooks ─────────────────────────────────────────────────────────────

export function useAppNavigation() {
    return useNavigation<StackNavigationProp<RootStackParams>>();
}

export function useAppRoute<T extends keyof RootStackParams>() {
    return useRoute<RouteProp<RootStackParams, T>>();
}
