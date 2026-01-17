
import { SecurityStatus, ThreatEvent, IoTDevice } from '../types';

export const mitigationService = {
  /**
   * Determines the appropriate mitigation action based on threat intelligence.
   * Graduated Model: Observe -> Deceive -> Contain -> Isolate
   */
  determineAction: (threat: ThreatEvent, target: IoTDevice): SecurityStatus => {
    // Stage 4: Isolation (Critical or persistent correlated threats)
    if (threat.severity === 'Critical' || (threat.isCorrelated && threat.confidence > 0.9)) {
      return SecurityStatus.ISOLATING;
    }

    // Stage 3: Containment (High severity or high confidence anomalies)
    if (threat.severity === 'High' || threat.confidence > 0.8) {
      // Quarantined = Restricted internal communication
      // Rate Limited = Throttled external communication
      return target.criticality > 7 ? SecurityStatus.RATE_LIMITED : SecurityStatus.QUARANTINED;
    }

    // Stage 2: Deception (Medium severity)
    if (threat.severity === 'Medium') {
      return SecurityStatus.DECEPTION_ACTIVE;
    }

    // Stage 1: Observation
    return SecurityStatus.MONITORING;
  },

  getMitigationExplanation: (status: SecurityStatus, type: string): string => {
    switch (status) {
      case SecurityStatus.RATE_LIMITED:
        return `Autonomous Mitigation: Traffic throttled to 64Kbps for ${type} signature. Egress filtered.`;
      case SecurityStatus.QUARANTINED:
        return `Autonomous Mitigation: Device isolated to Segment-Z. All peer-to-peer frames rejected.`;
      case SecurityStatus.ISOLATING:
        return `Autonomous Mitigation: Node completely severed from mesh. Hardware reset required for re-entry.`;
      case SecurityStatus.DECEPTION_ACTIVE:
        return `Autonomous Mitigation: Topology rotation initiated. Attacker diverted to shadow proxy.`;
      default:
        return `Monitoring phase initiated. No active disruption applied.`;
    }
  }
};
