// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// ─── Crypto / Solana polyfill aliases ─────────────────────────────────────────
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    crypto: require.resolve('react-native-quick-crypto'),
    buffer: require.resolve('@craftzdog/react-native-buffer'),
    stream: require.resolve('readable-stream'),
};

module.exports = config;
