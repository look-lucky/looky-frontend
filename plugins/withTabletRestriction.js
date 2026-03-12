const { withAndroidManifest } = require("expo/config-plugins");

const withTabletRestriction = (config) => {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;

    // Remove existing supports-screens if any
    delete manifest["supports-screens"];

    manifest["supports-screens"] = [
      {
        $: {
          "android:smallScreens": "true",
          "android:normalScreens": "true",
          "android:largeScreens": "false",
          "android:xlargeScreens": "false",
        },
      },
    ];

    return mod;
  });
};

module.exports = withTabletRestriction;
