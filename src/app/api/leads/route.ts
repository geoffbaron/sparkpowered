import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { zipToState } from "@/lib/zipToState";

export interface Lead {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  zip: string;
  state: string | null;
  homeOwner: string;
  roofAge: string;
  monthlyBill: string;
  interest: string[];
  installerId: string;
  installerName: string;
}

const LEADS_FILE = path.join(process.cwd(), "data", "leads.json");

async function readLeads(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8");
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

async function writeLeads(leads: Lead[]): Promise<void> {
  await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// POST /api/leads — save a new lead
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, zip, homeOwner, roofAge, monthlyBill, interest, installerId, installerName } = body;

  if (!name || !email || !zip) {
    return NextResponse.json({ error: "name, email, and zip are required" }, { status: 400 });
  }

  const lead: Lead = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    name,
    email,
    phone: phone ?? "",
    zip,
    state: zipToState(zip),
    homeOwner: homeOwner ?? "",
    roofAge: roofAge ?? "",
    monthlyBill: monthlyBill ?? "",
    interest: interest ?? [],
    installerId: installerId ?? "",
    installerName: installerName ?? "",
  };

  const leads = await readLeads();
  leads.push(lead);
  await writeLeads(leads);

  return NextResponse.json({ ok: true, id: lead.id });
}

// GET /api/leads — return all leads (admin only, checked via cookie)
export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_auth")?.value;
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await readLeads();
  return NextResponse.json({ leads });
}
