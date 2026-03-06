/**
 * SeekHer — Crypto Polyfills
 * Must be imported as the FIRST import in index.js
 * before any other code, especially @solana/web3.js
 */

// 1. getRandomValues — required for key generation
import 'react-native-get-random-values';

// 2. Buffer — required by Solana web3.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Buffer: CraftzBuffer } = require('@craftzdog/react-native-buffer');
// @ts-ignore — craftzdog buffer is compatible at runtime but its type differs from node's
global.Buffer = CraftzBuffer;

// 3. TextEncoder / TextDecoder — required by borsh / metaplex
// @ts-ignore — text-encoding has no types; safe at runtime
const { TextEncoder: TE, TextDecoder: TD } = require('text-encoding');
if (typeof (global as any).TextEncoder === 'undefined') {
    (global as any).TextEncoder = TE;
}
if (typeof (global as any).TextDecoder === 'undefined') {
    (global as any).TextDecoder = TD;
}

// 4. process.env shim (some Solana packages use it)
if (typeof (global as any).process === 'undefined') {
    (global as any).process = { env: {} };
}
