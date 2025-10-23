export default {
    expo: {
        name: "fit-app",
        slug: "fit-app",
        version: "1.0.0",
        scheme: "acme",
        orientation: "default",
        userInterfaceStyle: "automatic",
        icon: "./assets/icon.png",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        assetBundlePatterns: ["**/*"],
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            }
        },
        web: {
            favicon: "./assets/favicon.png",
            output: "server"
        },
        plugins: [
            [
                "expo-router",
                {
                    "origin": "https://n"
                }
            ]
        ],
        extra: {
            openaiApiKey: process.env.OPENAI_API_KEY,
        }
    }
};