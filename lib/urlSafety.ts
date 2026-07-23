import { lookup } from "dns/promises";
import { isIP } from "net";

export class UnsafeUrlError extends Error {
  readonly code = "UNSAFE_URL";

  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "metadata.goog",
  "metadata.azure.com",
  "metadata.packet.net",
  "instance-data",
]);

function ipv4ToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return (
    ((parts[0] << 24) >>> 0) +
    ((parts[1] << 16) >>> 0) +
    ((parts[2] << 8) >>> 0) +
    (parts[3] >>> 0)
  );
}

function isIpv4InCidr(ip: string, cidr: string): boolean {
  const [base, bitsRaw] = cidr.split("/");
  const bits = Number(bitsRaw);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(base) & mask);
}

/** Private, loopback, link-local, CGNAT, multicast, and other non-public ranges. */
const BLOCKED_IPV4_CIDRS = [
  "0.0.0.0/8",
  "10.0.0.0/8",
  "100.64.0.0/10",
  "127.0.0.0/8",
  "169.254.0.0/16",
  "172.16.0.0/12",
  "192.0.0.0/24",
  "192.0.2.0/24",
  "192.168.0.0/16",
  "198.18.0.0/15",
  "198.51.100.0/24",
  "203.0.113.0/24",
  "224.0.0.0/4",
  "240.0.0.0/4",
];

function isBlockedIpv4(ip: string): boolean {
  return BLOCKED_IPV4_CIDRS.some((cidr) => isIpv4InCidr(ip, cidr));
}

function expandIpv6(ip: string): number[] {
  const [head, tail] = ip.toLowerCase().split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];
  const missing = 8 - (headParts.length + tailParts.length);
  const parts = [
    ...headParts,
    ...Array(Math.max(missing, 0)).fill("0"),
    ...tailParts,
  ];

  while (parts.length < 8) parts.push("0");

  return parts.slice(0, 8).map((p) => parseInt(p || "0", 16));
}

function isBlockedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // IPv4-mapped IPv6 (:ffff:x.x.x.x) — validate the embedded IPv4.
  const mapped = normalized.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return isBlockedIpv4(mapped[1]);

  const hexMapped = normalized.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hexMapped) {
    const hi = parseInt(hexMapped[1], 16);
    const lo = parseInt(hexMapped[2], 16);
    const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
    return isBlockedIpv4(ipv4);
  }

  const parts = expandIpv6(normalized);

  // :: and ::1
  if (parts.every((p) => p === 0)) return true;
  if (
    parts[0] === 0 &&
    parts[1] === 0 &&
    parts[2] === 0 &&
    parts[3] === 0 &&
    parts[4] === 0 &&
    parts[5] === 0 &&
    parts[6] === 0 &&
    parts[7] === 1
  ) {
    return true;
  }

  // fe80::/10 link-local
  if ((parts[0] & 0xffc0) === 0xfe80) return true;
  // fc00::/7 unique local
  if ((parts[0] & 0xfe00) === 0xfc00) return true;
  // ff00::/8 multicast
  if ((parts[0] & 0xff00) === 0xff00) return true;

  return false;
}

export function isBlockedIpAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isBlockedIpv4(ip);
  if (version === 6) return isBlockedIpv6(ip);
  return true;
}

function assertSafeHostname(hostname: string): void {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (!host) {
    throw new UnsafeUrlError("URL hostname is required.");
  }

  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith(".localhost")) {
    throw new UnsafeUrlError("Requests to localhost or metadata hosts are not allowed.");
  }

  // Numeric / hex / octal host tricks often parse as IPs — treat any IP literal as suspect.
  const ipVersion = isIP(host);
  if (ipVersion && isBlockedIpAddress(host)) {
    throw new UnsafeUrlError(
      "Requests to private, loopback, link-local, or metadata IP addresses are not allowed.",
    );
  }
}

async function assertResolvedAddressesArePublic(hostname: string): Promise<void> {
  const host = hostname.replace(/^\[|\]$/g, "");

  // IP literals are already checked in assertSafeHostname.
  if (isIP(host)) return;

  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new UnsafeUrlError("Unable to resolve endpoint hostname.");
  }

  if (!addresses.length) {
    throw new UnsafeUrlError("Endpoint hostname did not resolve to any address.");
  }

  for (const { address } of addresses) {
    if (isBlockedIpAddress(address)) {
      throw new UnsafeUrlError(
        "Endpoint resolves to a private, loopback, link-local, or metadata address.",
      );
    }
  }
}

/**
 * Validates that a user-supplied endpoint is a public http(s) URL.
 * Resolves DNS and rejects private / loopback / link-local / metadata targets.
 * Returns the normalized href to use for fetching.
 */
export async function assertSafeHttpUrl(raw: string): Promise<string> {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new UnsafeUrlError("Endpoint URL is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new UnsafeUrlError("Endpoint must be a valid URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UnsafeUrlError("Only http and https endpoints are allowed.");
  }

  if (parsed.username || parsed.password) {
    throw new UnsafeUrlError("URLs with embedded credentials are not allowed.");
  }

  assertSafeHostname(parsed.hostname);
  await assertResolvedAddressesArePublic(parsed.hostname);

  return parsed.href;
}
