
import { IoTDevice, DeviceType, SecurityStatus, Honeytoken, DecoyConfig, ThreatEvent } from '../types';

export const deceptionService = {
  generateDecoy: (type: DeviceType): IoTDevice => {
    const id = `decoy-${Math.random().toString(36).substr(2, 5)}`;
    const ip = `192.168.1.${Math.floor(Math.random() * 50) + 200}`;
    
    const names = {
      [DeviceType.CAMERA]: 'Legacy-Security-Cam',
      [DeviceType.NAS]: 'Old-Storage-Server',
      [DeviceType.ROUTER]: 'Wrt-Gateway-Dev',
      [DeviceType.DECOY]: 'Vulnerable-Node-Alpha'
    };

    return {
      id,
      name: names[type as keyof typeof names] || 'Legacy-IoT-Node',
      type: DeviceType.DECOY,
      ip,
      mac: Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':'),
      criticality: 1,
      vulnerabilityScore: 0.9,
      anomalyScore: 0,
      status: SecurityStatus.DECEPTION_ACTIVE,
      lastSeen: new Date().toISOString(),
      vendor: 'Virtualized-Deception-Stack',
      isAuthorized: true,
      isDecoy: true,
      fingerprintConfidence: 1.0,
      detectedProtocols: ['Telnet', 'HTTP', 'FTP'],
      trafficSignature: 'Deceptive-Beacon'
    };
  },

  /**
   * Analyzes an interaction with a decoy to generate new intelligence.
   */
  extractIntelligence: (threat: ThreatEvent): { signature: string; blockImmediate: boolean } => {
    // If a decoy is hit, we immediately flag the pattern
    const isHighRisk = threat.severity === 'Critical' || threat.type === 'Botnet C2';
    return {
      signature: `DECEPTION_FEEDBACK_${threat.type.toUpperCase()}_${threat.sourceIp}`,
      blockImmediate: isHighRisk
    };
  },

  getHoneytokens: (): Honeytoken[] => [
    {
      id: 'ht1',
      type: 'Credential',
      name: 'Admin SSH Key',
      value: 'ssh-rsa AAAAB3Nza...',
      location: '/etc/shastra/agent.key',
      triggeredCount: 0
    },
    {
      id: 'ht2',
      type: 'API-Key',
      name: 'Cloud-Sync-Secret',
      value: 'AKIA_PROD_9921_SECRET',
      location: 'Environment Variable',
      triggeredCount: 0
    },
    {
      id: 'ht3',
      type: 'DB-Record',
      name: 'Vault-Metadata',
      value: 'root:shastra_admin_pass',
      location: 'Fake-SQL-Decoy',
      triggeredCount: 0
    }
  ],

  getDecoyConfigs: (): DecoyConfig[] => [
    { id: 'dc1', name: 'Telnet Decoy', type: DeviceType.ROUTER, vulnerabilityTarget: 'Weak Credentials', active: true, interactionLevel: 'High', hits: 12 },
    { id: 'dc2', name: 'RTSP Decoy', type: DeviceType.CAMERA, vulnerabilityTarget: 'Unauthenticated Stream', active: true, interactionLevel: 'Low', hits: 5 },
    { id: 'dc3', name: 'Samba Decoy', type: DeviceType.NAS, vulnerabilityTarget: 'Directory Traversal', active: false, interactionLevel: 'High', hits: 0 }
  ]
};
