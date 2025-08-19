import { getConnectionStatus, getCurrentSubscription } from '../services/ws';

export function logWebSocketStatus() {
  const status = getConnectionStatus();
  const subscription = getCurrentSubscription();
  
  console.group('🔍 WebSocket Debug Status');
  console.log('Connection Status:', status);
  console.log('Current Subscription:', subscription);
  console.log('Subscription ID:', subscription?.id);
  console.log('Subscription Destination:', subscription?.destination);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
}

export function logMessageFlow(type: string, data: any) {
  console.group(`📨 ${type} - ${new Date().toISOString()}`);
  console.log('Data:', data);
  console.groupEnd();
}

export function logConnectionFlow(event: string, details: any = {}) {
  console.group(`🔌 Connection ${event} - ${new Date().toISOString()}`);
  console.log('Details:', details);
  console.log('Current Status:', getConnectionStatus());
  console.groupEnd();
}

// Add to window for easy debugging in console
if (typeof window !== 'undefined') {
  (window as any).debugWebSocket = logWebSocketStatus;
  (window as any).logMessageFlow = logMessageFlow;
  (window as any).logConnectionFlow = logConnectionFlow;
}
