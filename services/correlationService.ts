
import { ThreatEvent, IoTDevice } from '../types';

export const correlationService = {
  /**
   * Correlates a new threat with existing threat history to find multi-stage campaigns.
   */
  correlate: (newThreat: ThreatEvent, history: ThreatEvent[], devices: IoTDevice[]): Partial<ThreatEvent> => {
    // Find all threats from the same source IP in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const relatedThreats = history.filter(t => 
      t.sourceIp === newThreat.sourceIp && 
      new Date(t.timestamp) > tenMinutesAgo
    );

    if (relatedThreats.length === 0) {
      return { confidence: 0.6, isCorrelated: false };
    }

    // Correlation logic:
    // 1. Multi-target (Blast Radius)
    const uniqueTargets = new Set([...relatedThreats.map(t => t.targetDeviceId), newThreat.targetDeviceId]).size;
    
    // 2. Multi-stage (Vector sequence)
    const uniqueVectors = new Set([...relatedThreats.map(t => t.type), newThreat.type]).size;

    // 3. Path analysis (Recon -> Exploitation)
    let hasScan = [...relatedThreats, newThreat].some(t => t.type === 'Port Scan');
    let hasExploit = [...relatedThreats, newThreat].some(t => t.type === 'Brute Force' || t.type === 'Unauthorized Access');
    let hasMovement = [...relatedThreats, newThreat].some(t => t.type === 'Lateral Movement');

    // Calculate Confidence
    let confidence = 0.6; // Base confidence
    if (uniqueTargets > 1) confidence += 0.15;
    if (uniqueVectors > 1) confidence += 0.1;
    if (hasScan && hasExploit) confidence += 0.1;
    if (hasExploit && hasMovement) confidence += 0.1;

    // Severity upgrade for correlated campaigns
    const isCorrelated = relatedThreats.length > 0;
    const correlatedThreatIds = relatedThreats.map(t => t.id);

    return {
      confidence: Math.min(0.99, confidence),
      isCorrelated,
      correlatedThreatIds,
      type: hasMovement && hasExploit ? 'Lateral Movement' : newThreat.type
    };
  }
};
