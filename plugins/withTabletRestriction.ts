import { ConfigPlugin, withAndroidManifest } from "expo/config-plugins";

const withTabletRestriction: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;

    // Remove existing supports-screens if any
    delete (manifest as any)["supports-screens"];

    (manifest as any)["supports-screens"] = [
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

export default withTabletRestriction;
