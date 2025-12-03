import { XMLParser } from "fast-xml-parser";
import type { InsertHost, InsertService } from "@shared/schema";

interface NmapHost {
  status?: { "@_state": string };
  address?: { "@_addr": string; "@_addrtype": string } | Array<{ "@_addr": string; "@_addrtype": string }>;
  hostnames?: { hostname?: { "@_name": string } | Array<{ "@_name": string }> };
  os?: { osmatch?: { "@_name": string } | Array<{ "@_name": string }> };
  ports?: { port?: NmapPort | NmapPort[] };
}

interface NmapPort {
  "@_protocol": string;
  "@_portid": string;
  state?: { "@_state": string };
  service?: {
    "@_name": string;
    "@_product"?: string;
    "@_version"?: string;
  };
}

interface ParsedScan {
  hosts: InsertHost[];
  services: Map<string, InsertService[]>;
}

export function parseNmapXml(xmlContent: string): ParsedScan {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const parsed = parser.parse(xmlContent);
  const nmapRun = parsed.nmaprun;

  if (!nmapRun) {
    throw new Error("Invalid nmap XML format: missing nmaprun element");
  }

  const hosts: InsertHost[] = [];
  const servicesMap = new Map<string, InsertService[]>();

  let nmapHosts = nmapRun.host;
  if (!nmapHosts) {
    return { hosts, services: servicesMap };
  }

  if (!Array.isArray(nmapHosts)) {
    nmapHosts = [nmapHosts];
  }

  for (const nmapHost of nmapHosts as NmapHost[]) {
    const hostData = parseHost(nmapHost);
    if (hostData) {
      hosts.push(hostData.host);
      if (hostData.services.length > 0) {
        servicesMap.set(hostData.host.ip, hostData.services);
      }
    }
  }

  return { hosts, services: servicesMap };
}

function parseHost(nmapHost: NmapHost): { host: InsertHost; services: InsertService[] } | null {
  // Get IP address
  let ip = "";
  const addresses = nmapHost.address;
  
  if (Array.isArray(addresses)) {
    const ipv4 = addresses.find((a) => a["@_addrtype"] === "ipv4");
    ip = ipv4?.["@_addr"] || addresses[0]?.["@_addr"] || "";
  } else if (addresses) {
    ip = addresses["@_addr"] || "";
  }

  if (!ip) {
    return null;
  }

  // Get status
  const status = nmapHost.status?.["@_state"] === "up" ? "up" : "down";

  // Get hostname
  let hostname: string | undefined;
  const hostnames = nmapHost.hostnames?.hostname;
  if (Array.isArray(hostnames)) {
    hostname = hostnames[0]?.["@_name"];
  } else if (hostnames) {
    hostname = hostnames["@_name"];
  }

  // Get OS
  let os: string | undefined;
  const osmatch = nmapHost.os?.osmatch;
  if (Array.isArray(osmatch)) {
    os = osmatch[0]?.["@_name"];
  } else if (osmatch) {
    os = osmatch["@_name"];
  }

  const host: InsertHost = {
    ip,
    hostname,
    os,
    status: status as "up" | "down" | "unknown",
  };

  // Parse services
  const services: InsertService[] = [];
  const ports = nmapHost.ports?.port;

  if (ports) {
    const portList = Array.isArray(ports) ? ports : [ports];

    for (const port of portList) {
      const portId = parseInt(port["@_portid"], 10);
      const protocol = port["@_protocol"] as "tcp" | "udp";
      const state = port.state?.["@_state"] || "unknown";
      const serviceName = port.service?.["@_name"] || "unknown";
      const product = port.service?.["@_product"];
      const version = port.service?.["@_version"];

      services.push({
        hostId: "", // Will be set after host is created
        port: portId,
        protocol,
        name: serviceName,
        product,
        version,
        state: state as "open" | "closed" | "filtered",
      });
    }
  }

  return { host, services };
}
