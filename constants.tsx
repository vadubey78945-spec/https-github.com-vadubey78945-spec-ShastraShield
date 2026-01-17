
import React from 'react';
import { DeviceType, IoTDevice, SecurityStatus } from './types';

export const CRITICALITY_MAP: Record<DeviceType, number> = {
  [DeviceType.ROUTER]: 10,
  [DeviceType.SMART_LOCK]: 9,
  [DeviceType.CAMERA]: 8,
  [DeviceType.NAS]: 7,
  [DeviceType.THERMOSTAT]: 5,
  [DeviceType.TV]: 4,
  [DeviceType.LIGHT]: 2,
  // Fix: Added missing DECOY criticality mapping
  [DeviceType.DECOY]: 1,
  [DeviceType.UNKNOWN]: 1,
};

export const INITIAL_DEVICES: IoTDevice[] = [
  {
    id: 'd1',
    name: 'Core Gateway',
    type: DeviceType.ROUTER,
    ip: '192.168.1.1',
    mac: '00:14:22:01:23:45',
    criticality: 10,
    vulnerabilityScore: 0.15,
    anomalyScore: 0.02,
    status: SecurityStatus.SECURE,
    lastSeen: new Date().toISOString(),
    vendor: 'Ubiquiti',
    isAuthorized: true,
    fingerprintConfidence: 0.99,
    detectedProtocols: ['DHCP', 'DNS', 'HTTP/S', 'SSH'],
    trafficSignature: 'Core-Infrastructure'
  },
  {
    id: 'd2',
    name: 'Front Door Lock',
    type: DeviceType.SMART_LOCK,
    ip: '192.168.1.42',
    mac: 'AA:BB:CC:DD:EE:FF',
    criticality: 9,
    vulnerabilityScore: 0.45,
    anomalyScore: 0.05,
    status: SecurityStatus.SECURE,
    lastSeen: new Date().toISOString(),
    vendor: 'August',
    isAuthorized: true,
    fingerprintConfidence: 0.95,
    detectedProtocols: ['Z-Wave', 'MQTT'],
    trafficSignature: 'Burst-Intermittent'
  },
  {
    id: 'd3',
    name: 'Backyard Cam',
    type: DeviceType.CAMERA,
    ip: '192.168.1.55',
    mac: '11:22:33:44:55:66',
    criticality: 8,
    vulnerabilityScore: 0.65,
    anomalyScore: 0.08,
    status: SecurityStatus.SECURE,
    lastSeen: new Date().toISOString(),
    vendor: 'Hikvision',
    isAuthorized: true,
    fingerprintConfidence: 0.88,
    detectedProtocols: ['RTSP', 'ONVIF', 'HTTP'],
    trafficSignature: 'Constant-Bitrate-Stream'
  }
];

export const DEVICE_ICONS: Record<DeviceType, React.ReactNode> = {
  [DeviceType.ROUTER]: <i className="fas fa-network-wired"></i>,
  [DeviceType.SMART_LOCK]: <i className="fas fa-lock"></i>,
  [DeviceType.CAMERA]: <i className="fas fa-video"></i>,
  [DeviceType.NAS]: <i className="fas fa-server"></i>,
  [DeviceType.THERMOSTAT]: <i className="fas fa-thermometer-half"></i>,
  [DeviceType.TV]: <i className="fas fa-tv"></i>,
  [DeviceType.LIGHT]: <i className="fas fa-lightbulb"></i>,
  // Fix: Added missing DECOY icon mapping
  [DeviceType.DECOY]: <i className="fas fa-ghost"></i>,
  [DeviceType.UNKNOWN]: <i className="fas fa-question-circle"></i>,
};
