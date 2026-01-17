
import { IoTDevice, DeviceType, VulnerabilityProfile, CVE } from '../types';

/**
 * Offline CVE Database Simulation (Signature-based)
 */
const CVE_DATABASE: Record<string, CVE[]> = {
  [DeviceType.CAMERA]: [
    { id: 'CVE-2023-1209', description: 'RTSP Buffer Overflow in Hikvision firmware', cvss: 8.8 },
    { id: 'CVE-2024-0012', description: 'Hardcoded credentials in cloud sync module', cvss: 9.1 }
  ],
  [DeviceType.NAS]: [
    { id: 'CVE-2023-4421', description: 'Unauthenticated File Access in Samba implementation', cvss: 7.5 },
    { id: 'CVE-2024-1102', description: 'Directory traversal in web management interface', cvss: 8.2 }
  ],
  [DeviceType.ROUTER]: [
    { id: 'CVE-2022-3001', description: 'UPnP vulnerability allowing remote code execution', cvss: 9.8 },
    { id: 'CVE-2024-5501', description: 'Stack-based buffer overflow in DNS relay', cvss: 9.3 }
  ],
  [DeviceType.SMART_LOCK]: [
    { id: 'CVE-2023-8890', description: 'Replay attack susceptibility in BLE handshake', cvss: 6.2 }
  ]
};

/**
 * Generates a dynamic vulnerability profile for a device based on prioritized factors.
 */
export const generateRiskProfile = (device: IoTDevice): VulnerabilityProfile => {
  const cves = CVE_DATABASE[device.type] || [];
  const firmwareAgeDays = Math.floor(Math.random() * 800);
  const weakAuth = device.type === DeviceType.CAMERA || device.type === DeviceType.LIGHT || device.type === DeviceType.UNKNOWN ? Math.random() > 0.4 : false;
  const exposure = device.type === DeviceType.ROUTER ? 1.0 : device.type === DeviceType.CAMERA ? 0.7 : device.type === DeviceType.NAS ? 0.3 : 0.05;

  // Predictive Risk logic: Weighted factors simulating an AI exploitability model
  // Factors: (CVE Impact * 0.4) + (Auth Fragility * 0.25) + (Exposure * 0.2) + (Age * 0.15)
  const cveImpact = cves.length > 0 ? (Math.max(...cves.map(c => c.cvss)) / 10) : 0;
  let predictive = (cveImpact * 0.4) + (weakAuth ? 0.25 : 0) + (exposure * 0.2) + ((firmwareAgeDays / 1000) * 0.15);
  
  // Add some jitter to simulate "live" behavioral drift
  predictive = Math.min(1.0, Math.max(0.1, predictive + (Math.random() * 0.1 - 0.05)));

  return {
    firmwareVersion: `v${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 20)}`,
    firmwareAgeDays,
    knownCVEs: cves,
    weakAuthDetected: weakAuth,
    internetExposure: exposure,
    predictiveRiskScore: predictive,
    lastAuditDate: new Date().toISOString()
  };
};

/**
 * Calculates the overall normalized vulnerability score (0.0 - 1.0)
 * Weights are tuned for production-grade security prioritization.
 */
export const calculateNormalizedVulnerability = (profile: VulnerabilityProfile): number => {
  // Component 1: Known CVE Impact (Highest Weight)
  const cveScore = profile.knownCVEs.length > 0 
    ? profile.knownCVEs.reduce((acc, cve) => acc + (cve.cvss / 10), 0) / (profile.knownCVEs.length)
    : 0;

  // Component 2: Auth Patterns
  const authScore = profile.weakAuthDetected ? 1.0 : 0.0;

  // Component 3: Internet Exposure
  const exposureScore = profile.internetExposure;

  // Component 4: Firmware Age (Decay function)
  const ageScore = Math.min(1.0, profile.firmwareAgeDays / 365);

  // Final Weighted Average
  const totalScore = (
    (cveScore * 0.35) + 
    (authScore * 0.25) + 
    (exposureScore * 0.25) + 
    (ageScore * 0.15)
  );
  
  return Math.min(1.0, Math.max(0.01, totalScore));
};
