
import { IoTDevice, DeviceType, SecurityStatus } from '../types';

const SHADOW_VENDORS = ['Unknown', 'Espressif', 'Tuya', 'Xiaomi', 'Broadlink'];
const COMMON_PROTOCOLS = ['MQTT', 'CoAP', 'HTTP', 'mDNS', 'UPnP', 'SSDP', 'Telnet'];

export const discoverShadowDevice = (): IoTDevice => {
  const id = 'shadow-' + Math.random().toString(36).substr(2, 5);
  const vendor = SHADOW_VENDORS[Math.floor(Math.random() * SHADOW_VENDORS.length)];
  const ip = `192.168.1.${Math.floor(Math.random() * 200) + 50}`;
  
  const protocols = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
    COMMON_PROTOCOLS[Math.floor(Math.random() * COMMON_PROTOCOLS.length)]
  );

  return {
    id,
    name: `Shadow Node [${ip.split('.').pop()}]`,
    type: DeviceType.UNKNOWN,
    ip,
    mac: Array.from({ length: 6 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    ).join(':'),
    criticality: 1,
    vulnerabilityScore: 0.7 + Math.random() * 0.3,
    anomalyScore: 0.4,
    status: SecurityStatus.UNAUTHORIZED,
    lastSeen: new Date().toISOString(),
    vendor,
    isAuthorized: false,
    fingerprintConfidence: 0.4 + Math.random() * 0.4,
    detectedProtocols: [...new Set(protocols)],
    trafficSignature: Math.random() > 0.5 ? 'Suspicious-Beacon' : 'Quiet-Listener'
  };
};

export const fingerprintDevice = (device: IoTDevice): Partial<IoTDevice> => {
  // Logic to "upgrade" an unknown device once analyzed
  const types = [DeviceType.LIGHT, DeviceType.TV, DeviceType.THERMOSTAT];
  return {
    type: types[Math.floor(Math.random() * types.length)],
    fingerprintConfidence: 0.92,
    isAuthorized: true,
    status: SecurityStatus.SECURE
  };
};
