export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

export const isReactNative = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
};

export const canUseAsyncStorage = (): boolean => {
  return isBrowser() || isReactNative();
};
