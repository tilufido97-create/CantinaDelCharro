const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude problematic packages on web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.alias = {
  'jimp-compact': false,
};

// Exclude jimp from web bundle
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;