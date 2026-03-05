import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { SolanaMobileWalletAdapterErrorCode } from '@solana-mobile/mobile-wallet-adapter-protocol';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletContextValue {
    wallet: PublicKey | null;
    connected: boolean;
    connecting: boolean;
    walletAddress: string | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    signTransaction: (tx: Transaction) => Promise<Transaction>;
    signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@seekher_wallet';
const APP_IDENTITY = {
    name: 'SeekHer',
    uri: 'https://seekher.app',
    icon: 'favicon.ico',
};

// ─── Context ──────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [wallet, setWallet] = useState<PublicKey | null>(null);
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);

    // Store the auth token from MWA so we can reuse it for silent reconnect
    const authTokenRef = useRef<string | null>(null);

    // ── Silent reconnect on app launch ──────────────────────────────────────────
    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (!stored) return;
            try {
                const { address, authToken } = JSON.parse(stored) as {
                    address: string;
                    authToken: string;
                };
                authTokenRef.current = authToken;
                setWallet(new PublicKey(address));
                setConnected(true);
            } catch {
                await AsyncStorage.removeItem(STORAGE_KEY);
            }
        })();
    }, []);

    // ── Connect ─────────────────────────────────────────────────────────────────
    const connect = useCallback(async () => {
        setConnecting(true);
        try {
            await transact(async (mobileWallet) => {
                const authResult = await mobileWallet.authorize({
                    cluster: 'mainnet-beta',
                    identity: APP_IDENTITY,
                });

                const address = authResult.accounts[0].address;
                const authToken = authResult.auth_token;
                const pubkey = new PublicKey(address);

                authTokenRef.current = authToken;
                setWallet(pubkey);
                setConnected(true);

                await AsyncStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ address: pubkey.toBase58(), authToken }),
                );
            });
        } catch (err: unknown) {
            const code = (err as { errorCode?: string }).errorCode;
            if (code === SolanaMobileWalletAdapterErrorCode.ERROR_WALLET_NOT_FOUND) {
                throw new Error(
                    'No Solana wallet app found. Please install Phantom or another Solana wallet.',
                );
            }
            throw err;
        } finally {
            setConnecting(false);
        }
    }, []);

    // ── Disconnect ───────────────────────────────────────────────────────────────
    const disconnect = useCallback(async () => {
        try {
            await transact(async (mobileWallet) => {
                if (authTokenRef.current) {
                    await mobileWallet.deauthorize({ auth_token: authTokenRef.current });
                }
            });
        } catch {
            // Swallow — we still want to clear local state even if RPC call fails
        } finally {
            authTokenRef.current = null;
            setWallet(null);
            setConnected(false);
            await AsyncStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    // ── Sign Transaction ─────────────────────────────────────────────────────────
    const signTransaction = useCallback(async (tx: Transaction): Promise<Transaction> => {
        return transact(async (mobileWallet) => {
            const authResult = await mobileWallet.authorize({
                cluster: 'mainnet-beta',
                identity: APP_IDENTITY,
            });
            authTokenRef.current = authResult.auth_token;

            const signedPayloads = await mobileWallet.signTransactions({
                transactions: [tx],
            });
            return signedPayloads[0] as unknown as Transaction;
        });
    }, []);

    // ── Sign Message ─────────────────────────────────────────────────────────────
    const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array> => {
        return transact(async (mobileWallet) => {
            const authResult = await mobileWallet.authorize({
                cluster: 'mainnet-beta',
                identity: APP_IDENTITY,
            });
            authTokenRef.current = authResult.auth_token;

            // signMessages returns Promise<Uint8Array[]>
            const results = await mobileWallet.signMessages({
                addresses: [wallet?.toBase58() ?? ''],
                payloads: [message],
            });
            return results[0];
        });
    }, [wallet]);


    // ── Memoised value ───────────────────────────────────────────────────────────
    const value = useMemo<WalletContextValue>(() => ({
        wallet,
        connected,
        connecting,
        walletAddress: wallet?.toBase58() ?? null,
        connect,
        disconnect,
        signTransaction,
        signMessage,
    }), [wallet, connected, connecting, connect, disconnect, signTransaction, signMessage]);

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextValue {
    const ctx = useContext(WalletContext);
    if (!ctx) throw new Error('useWallet must be used within WalletProvider');
    return ctx;
}
