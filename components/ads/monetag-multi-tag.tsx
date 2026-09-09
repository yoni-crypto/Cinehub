import { adsEnabled } from '@/lib/config/ads';

export function MonetagMultiTag() {
  if (!adsEnabled) return null;
  return (
    <script
      src="https://quge5.com/88/tag.min.js"
      data-zone="278163"
      async
      data-cfasync="false"
    />
  );
}