/**
 * Photos used on the site. All are free-license stock photos (Unsplash License
 * or Pexels License), downloaded and stored locally as WebP in public/images.
 * Credits are shown on the page that uses each photo and on /about.
 */

export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: string;
  creditUrl: string;
  pageUrl: string;
  license: string;
}

export type ImageKey =
  | "hero"
  | "ev"
  | "solar-roof"
  | "plugin-solar"
  | "power-station"
  | "home-battery"
  | "heat-pump"
  | "induction"
  | "ebike"
  | "outage";

export const IMAGES: Partial<Record<ImageKey, SiteImage>> = {
  "hero": { src: "/images/hero-1600.webp", width: 1600, height: 1068, alt: "Smiling father holding a toddler on his shoulders and hugging his young son outside a home with a white picket fence", credit: "Nathan Dumlao on Unsplash", creditUrl: "https://unsplash.com/@nate_dumlao", pageUrl: "https://unsplash.com/photos/Wr3comVZJxU", license: "Unsplash License" },
  "ev": { src: "/images/ev-1600.webp", width: 1600, height: 1067, alt: "Woman in a yellow scarf plugging her electric car into a wall charger beside her front door", credit: "Zaptec on Unsplash", creditUrl: "https://unsplash.com/@zaptec", pageUrl: "https://unsplash.com/photos/DQQ2jvg-mjI", license: "Unsplash License" },
  "solar-roof": { src: "/images/solar-roof-1600.webp", width: 1600, height: 901, alt: "Rooftop solar panels on a suburban house under a clear blue sky", credit: "Watt A Lot on Unsplash", creditUrl: "https://unsplash.com/@wattalot", pageUrl: "https://unsplash.com/photos/Ja8t8nJN2I4", license: "Unsplash License" },
  "plugin-solar": { src: "/images/plugin-solar-1600.webp", width: 1600, height: 1067, alt: "Two plug-in solar panels mounted on the railing of a ground-floor apartment balcony in the sun", credit: "Yuma Solar on Unsplash", creditUrl: "https://unsplash.com/@yuma_solar", pageUrl: "https://unsplash.com/photos/kS2rEtx-JoU", license: "Unsplash License" },
  "power-station": { src: "/images/power-station-1600.webp", width: 1600, height: 1067, alt: "Couple relaxing on a sunny deck among pine trees with a portable power station running a grill and a cooler", credit: "Jackery Power Station on Unsplash", creditUrl: "https://unsplash.com/@jackery_official", pageUrl: "https://unsplash.com/photos/b7XI4DJbcw0", license: "Unsplash License" },
  "home-battery": { src: "/images/home-battery-1600.webp", width: 1600, height: 1200, alt: "Wall-mounted home battery and solar inverter system neatly installed on a garage wall", credit: "Sergio Martins on Unsplash", creditUrl: "https://unsplash.com/@smartins20", pageUrl: "https://unsplash.com/photos/7WzD2mTRWK8", license: "Unsplash License" },
  "heat-pump": { src: "/images/heat-pump-1600.webp", width: 1600, height: 1067, alt: "Outdoor heat pump unit on the lawn beside a brick house, framed by green shrubs", credit: "alpha innotec on Unsplash", creditUrl: "https://unsplash.com/@alpha_innotec", pageUrl: "https://unsplash.com/photos/4VCm8l6wLQY", license: "Unsplash License" },
  "induction": { src: "/images/induction-1600.webp", width: 1600, height: 1067, alt: "Person lifting the lid of a stainless steel pot on a sleek black induction cooktop", credit: "Obi Udensi on Unsplash", creditUrl: "https://unsplash.com/@pltransform", pageUrl: "https://unsplash.com/photos/sbwdMgZzZn8", license: "Unsplash License" },
  "ebike": { src: "/images/ebike-1600.webp", width: 1600, height: 1068, alt: "Smiling woman in a helmet riding an e-bike along a sunny tree-lined path", credit: "KBO Bike on Unsplash", creditUrl: "https://unsplash.com/@kbobike", pageUrl: "https://unsplash.com/photos/TWhMC6KO_4Y", license: "Unsplash License" },
  "outage": { src: "/images/outage-1600.webp", width: 1600, height: 900, alt: "Small house at night with warm lights glowing in the windows while the street around it is dark", credit: "Devon MacKay on Unsplash", creditUrl: "https://unsplash.com/@devon_mac", pageUrl: "https://unsplash.com/photos/fhU7X34rCAE", license: "Unsplash License" },
};
