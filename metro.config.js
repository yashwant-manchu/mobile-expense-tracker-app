const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add the 'cjs' extension to the resolver
config.resolver.sourceExts.push('cjs');

// Apply NativeWind with the desired input CSS file
module.exports = withNativeWind(config, { input: './app/globals.css' });
