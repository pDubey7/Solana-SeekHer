module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // NativeWind (Tailwind for React Native)
            'nativewind/babel',
            // Path alias resolution — must match tsconfig.json paths
            [
                'module-resolver',
                {
                    root: ['.'],
                    extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                    alias: {
                        '@screens': './src/screens',
                        '@components': './src/components',
                        '@hooks': './src/hooks',
                        '@services': './src/services',
                        '@utils': './src/utils',
                        '@context': './src/context',
                        '@navigation': './src/navigation',
                        '@constants': './src/constants',
                        '@app-types': './src/types',
                        '@assets': './src/assets',
                    },
                },
            ],
            // react-native-reanimated MUST be last
            'react-native-reanimated/plugin',
        ],
    };
};
