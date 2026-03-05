import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

const MAINNET_RPC = process.env.HELIUS_RPC_URL ?? 'https://api.mainnet-beta.solana.com';
const DEVNET_RPC = process.env.SOLANA_DEVNET_RPC ?? 'https://api.devnet.solana.com';

// ─── Cached connections ───────────────────────────────────────────────────────

let mainnetConnection: Connection | null = null;
let devnetConnection: Connection | null = null;

export function initConnection(network: 'mainnet' | 'devnet' = 'mainnet'): Connection {
    if (network === 'devnet') {
        if (!devnetConnection) devnetConnection = new Connection(DEVNET_RPC, 'confirmed');
        return devnetConnection;
    }
    if (!mainnetConnection) mainnetConnection = new Connection(MAINNET_RPC, 'confirmed');
    return mainnetConnection;
}

// ─── Balance ──────────────────────────────────────────────────────────────────

export async function getSOLBalance(wallet: string): Promise<number> {
    const connection = initConnection();
    const lamports = await connection.getBalance(new PublicKey(wallet));
    return lamports / LAMPORTS_PER_SOL;
}

// ─── SOL Tip Transfer ─────────────────────────────────────────────────────────

/**
 * Builds a SOL transfer, signs via the MWA signTransaction callback,
 * then sends and confirms. Returns the transaction signature.
 */
export async function sendSOLTip(
    fromWallet: string,
    toWallet: string,
    amountSOL: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
    const connection = initConnection();
    const from = new PublicKey(fromWallet);
    const to = new PublicKey(toWallet);

    const { blockhash } = await connection.getLatestBlockhash('confirmed');

    const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: from,
    }).add(
        SystemProgram.transfer({
            fromPubkey: from,
            toPubkey: to,
            lamports: Math.round(amountSOL * LAMPORTS_PER_SOL),
        }),
    );

    const signed = await signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await confirmTransaction(signature);
    return signature;
}

// ─── Confirmation ─────────────────────────────────────────────────────────────

export async function confirmTransaction(
    signature: string,
    timeoutMs = 30_000,
): Promise<boolean> {
    const connection = initConnection();
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const status = await connection.getSignatureStatus(signature);
        const conf = status?.value?.confirmationStatus;
        if (conf === 'confirmed' || conf === 'finalized') return true;
        if (status?.value?.err) return false;
        await new Promise((r) => setTimeout(r, 1500));
    }

    return false;
}
