import axios from "axios";
import { UAParser } from "ua-parser-js";

/**
 * Normalize IP to handle IPv6 localhost and IPv4-mapped IPv6
 */
export function normalizeIp(ip) {
  if (!ip) return "";
  if (ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.split(":").pop();
  return ip;
}

export function getClientIp(req) {
  const headers = req.headers;

  const forwarded =
    headers["x-forwarded-for"] ||
    headers["cf-connecting-ip"] ||
    headers["x-real-ip"];

  let ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip;

  return normalizeIp(ip);
}

/**
 * Get location details for given IP using ipapi.co
 */
export async function getIpLocation(ip) {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 2500,
    });
    const data = response.data;

    if (data.error) {
      console.error("IP location lookup error:", data.reason);
      return null;
    }

    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      region_code: data.region_code,
      country: data.country_name,
      country_code: data.country_code,
      postal: data.postal,
      latitude: data.latitude, // ✅ added
      longitude: data.longitude, // ✅ added
      org: data.org || data.asn, // ✅ ISP / Org
    };
  } catch (err) {
    console.error("IP location lookup failed:", err.message);
    return null;
  }
}

/**
 * Detect device type based on User-Agent
 */
export function getDeviceType(req) {
  const parser = new UAParser(req.headers["user-agent"]);
  const deviceType = parser.getDevice().type;

  if (deviceType === "mobile" || deviceType === "tablet") {
    return "mobile";
  }
  if (deviceType === "desktop" || !deviceType) {
    return "desktop";
  }
  return "unknown";
}
