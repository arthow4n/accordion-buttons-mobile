const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidDebugSigning(config) {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = config.modResults.contents.replace(
                'signingConfigs {',
                `signingConfigs {
        release {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }`
            );
        } else {
            throw new Error('Cannot modify build.gradle because it is not groovy');
        }
        return config;
    });
};
