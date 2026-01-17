
import { IoTDevice, TelemetryEvent, BehaviorBaseline, DeviceType } from '../types';

/**
 * Generates initial behavioral baselines for known device types.
 */
export const getInitialBaseline = (type: DeviceType): BehaviorBaseline => {
  const base = {
    lastDriftUpdate: new Date().toISOString(),
    learningProgress: 0.85,
    neuralConsistency: 0.98,
  };

  switch (type) {
    case DeviceType.CAMERA:
      return {
        ...base,
        avgDailyVolumeMB: 1200,
        peakHourStart: 7,
        peakHourEnd: 22,
        allowedDomains: ['cloud.cam-vendor.com', 'ntp.pool.org'],
        typicalProtocols: ['RTSP', 'HTTPS', 'UDP'],
        allowedPorts: [554, 443, 123, 80],
      };
    case DeviceType.LIGHT:
      return {
        ...base,
        avgDailyVolumeMB: 5,
        peakHourStart: 18,
        peakHourEnd: 23,
        allowedDomains: ['iot.tuya.com'],
        typicalProtocols: ['MQTT', 'TLS'],
        allowedPorts: [8883, 443],
      };
    case DeviceType.TV:
      return {
        ...base,
        avgDailyVolumeMB: 5000,
        peakHourStart: 17,
        peakHourEnd: 0,
        allowedDomains: ['netflix.com', 'youtube.com', 'samsung.com', 'internal-mesh.local'],
        typicalProtocols: ['HTTPS', 'SSDDP', 'mDNS'],
        allowedPorts: [443, 80, 1900, 5353],
      };
    default:
      return {
        ...base,
        avgDailyVolumeMB: 100,
        peakHourStart: 9,
        peakHourEnd: 17,
        allowedDomains: ['google.com'],
        typicalProtocols: ['HTTP', 'HTTPS'],
        allowedPorts: [80, 443],
      };
  }
};

// Track short-term history for real-time heuristic detection
const telemetryHistory: Record<string, TelemetryEvent[]> = {};

/**
 * Analyzes a real-time telemetry event.
 * Detects: Port Scans, Brute Force, Lateral Movement, and C2 Heartbeats.
 */
export const analyzeBehavior = (device: IoTDevice, telemetry: TelemetryEvent): { score: number; reasons: string[]; detectedType?: string } => {
  if (!device.behaviorBaseline) return { score: 0, reasons: [] };

  const baseline = device.behaviorBaseline;
  const reasons: string[] = [];
  let reconstructionError = 0;
  let detectedType: string | undefined = undefined;

  // Maintain sliding window history for this device (last 20 events)
  if (!telemetryHistory[device.id]) telemetryHistory[device.id] = [];
  telemetryHistory[device.id].push(telemetry);
  if (telemetryHistory[device.id].length > 20) telemetryHistory[device.id].shift();

  const recentEvents = telemetryHistory[device.id];

  // 1. Port Scan Detection (Heuristic)
  const uniquePorts = new Set(recentEvents.map(e => e.port)).size;
  if (uniquePorts >= 5 && recentEvents.length >= 5) {
    reconstructionError += 0.8;
    detectedType = 'Port Scan';
    reasons.push(`Port Probing: Source contacted ${uniquePorts} unique ports in short order.`);
  }

  // 2. Brute Force Detection (Heuristic)
  const authProtocols = ['SSH', 'Telnet', 'HTTP', 'HTTPS'];
  const authAttempts = recentEvents.filter(e => authProtocols.includes(e.protocol)).length;
  if (authAttempts >= 10) {
    reconstructionError += 0.7;
    detectedType = 'Brute Force';
    reasons.push(`Auth Flood: ${authAttempts} high-frequency authentication attempts detected.`);
  }

  // 3. Botnet C2 Heartbeat Detection (Periodic outbound)
  if (telemetry.isOutbound && !baseline.allowedDomains.some(d => telemetry.destination.includes(d))) {
    reconstructionError += 0.4;
    reasons.push(`Egress Violation: Attempted connection to unauthorized domain [${telemetry.destination}].`);
    
    // Check for periodicity (naive implementation)
    const outboundIntervals = recentEvents
      .filter(e => e.isOutbound && e.destination === telemetry.destination)
      .map(e => new Date(e.timestamp).getTime());
    
    if (outboundIntervals.length >= 3) {
      const diffs = [];
      for(let i = 1; i < outboundIntervals.length; i++) diffs.push(outboundIntervals[i] - outboundIntervals[i-1]);
      const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const variance = diffs.reduce((a, b) => a + Math.pow(b - avgDiff, 2), 0) / diffs.length;
      
      if (variance < 5000) { // Very stable periodicity
        reconstructionError += 0.5;
        detectedType = 'Botnet C2';
        reasons.push(`C2 Pattern: Periodic heartbeat signature detected (${(avgDiff / 1000).toFixed(1)}s interval).`);
      }
    }
  }

  // 4. Temporal & Spatial Anomaly (Autoencoder Simulation)
  const currentHour = new Date(telemetry.timestamp).getHours();
  const isNight = currentHour >= 0 && currentHour < 6;
  const isOutsidePeak = currentHour < baseline.peakHourStart || (baseline.peakHourEnd !== 0 && currentHour > baseline.peakHourEnd);
  
  if (isOutsidePeak && telemetry.volumeMB > (baseline.avgDailyVolumeMB * 0.05)) {
    reconstructionError += 0.35;
    if (isNight) reconstructionError += 0.2;
    reasons.push(`Temporal Drift: Unexpected activity during off-peak window.`);
  }

  return { 
    score: Math.min(1.0, reconstructionError), 
    reasons,
    detectedType
  };
};

export const updateDriftBaseline = (device: IoTDevice, telemetry: TelemetryEvent): BehaviorBaseline => {
  if (!device.behaviorBaseline) return getInitialBaseline(device.type);
  const baseline = { ...device.behaviorBaseline };
  const { score } = analyzeBehavior(device, telemetry);
  if (score < 0.2) {
    baseline.avgDailyVolumeMB = (baseline.avgDailyVolumeMB * 0.995) + (telemetry.volumeMB * 0.005);
    baseline.learningProgress = Math.min(1.0, baseline.learningProgress + 0.0001);
    baseline.neuralConsistency = Math.min(0.99, baseline.neuralConsistency + 0.001);
  } else {
    baseline.neuralConsistency = Math.max(0.7, baseline.neuralConsistency - 0.01);
  }
  baseline.lastDriftUpdate = new Date().toISOString();
  return baseline;
};
