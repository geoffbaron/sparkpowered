import type { Metadata } from "next";
import { HubLanding } from "@/components/hub";
import { hubById } from "@/data/hubs";
import { pageMetadata } from "@/lib/seo";

const HUB = hubById("outdoors");

export const metadata: Metadata = pageMetadata({ title: HUB.title, description: HUB.description, path: HUB.path });

export default function Page() {
  return <HubLanding hub={HUB} />;
}
