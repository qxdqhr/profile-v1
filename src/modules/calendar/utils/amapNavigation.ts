import {
  configureAppLauncher,
  openAmapNavigation,
  buildAmapNavigationUrl,
  launchAmapNavigation,
  type AppLaunchCallbacks,
  type AppLaunchResult,
} from 'sa2kit/common/appLauncher';

configureAppLauncher({ sourceApplication: 'profile-v1' });

export {
  openAmapNavigation,
  buildAmapNavigationUrl,
  launchAmapNavigation,
  type AppLaunchCallbacks,
  type AppLaunchResult,
};
