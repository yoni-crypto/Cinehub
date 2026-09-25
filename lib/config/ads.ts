export interface AdSlotConfig {
  enabled: boolean;
  label?: string;
  html?: string;
  iframeSrc?: string;
}

export interface AdFormatConfig extends AdSlotConfig {
  zoneId?: string | number;
  scriptSrc?: string;
  scriptInline?: string;
  minSecondsBetweenShows?: number;
  maxShowsPerSession?: number;
  loadDelayMs?: number;
}

export const adsEnabled = false;
export const adsConfig = {
  popunder: {
    enabled: true,
    zoneId: 11759543,
    servingDomain: '3nbf4.com',
  },
  pushNotifications: {
    enabled: true,
    scriptSrc: '',
    scriptInline: '',
    loadDelayMs: 2000,
  } satisfies AdFormatConfig,
  vignette: {
    enabled: true,
    scriptSrc: '',
    scriptInline: '',
    minSecondsBetweenShows: 420,
    maxShowsPerSession: 3,
    loadDelayMs: 3000,
  } satisfies AdFormatConfig,
  inPagePush: {
    enabled: true,
    label: 'Sponsored',
    html: '',
    iframeSrc: '',
  } satisfies AdSlotConfig,
  interstitial: {
    enabled: false,
    scriptSrc: '',
    scriptInline: '',
    minSecondsBetweenShows: 900,
    maxShowsPerSession: 2,
    loadDelayMs: 5000,
  } satisfies AdFormatConfig,
  multiTag: {
    enabled: false,
    scriptSrc: '',
    scriptInline: '',
    loadDelayMs: 1500,
  } satisfies AdFormatConfig,
};

export type AdFormatKey = keyof typeof adsConfig;