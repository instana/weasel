import {isSupported, getItem, setItem, removeItem} from './localStorage';
import {generateUniqueId, now} from './util';
import {info, warn} from './debug';
import vars from './vars';

interface Session {
  id: string,
  startTime: number,
  lastActivityTime: number
}

const storageSeparatorKey = '#';

export function trackSessions(sessionInactivityTimeoutMillis?: number,
  sessionTerminationTimeoutMillis?: number): void {

  if (!isSupported) {
    if (DEBUG) {
      info('Storage API is not available and session tracking is therefore not supported.');
    }
    return;
  }

  if (!sessionInactivityTimeoutMillis) {
    sessionInactivityTimeoutMillis = vars.defaultSessionInactivityTimeoutMillis;
  }
  if (!sessionTerminationTimeoutMillis) {
    sessionTerminationTimeoutMillis = vars.defaultSessionTerminationTimeoutMillis;
  }
  sessionInactivityTimeoutMillis = Math.min(sessionInactivityTimeoutMillis, vars.maxAllowedSessionTimeoutMillis);
  sessionTerminationTimeoutMillis = Math.min(sessionTerminationTimeoutMillis, vars.maxAllowedSessionTimeoutMillis);

  try {
    const storedValue = getItem(vars.sessionStorageKey);

    let session = parseSession(storedValue);
    if (session && !isSessionValid(session, sessionInactivityTimeoutMillis, sessionTerminationTimeoutMillis)) {
      session = null;
    }

    if (session) {
      session.lastActivityTime = now();
    } else {
      session = {
        id: generateUniqueId(),
        startTime: now(),
        lastActivityTime: now()
      };
    }

    setItem(vars.sessionStorageKey, serializeSession(session));
    vars.sessionId = session.id;
  } catch (e) {
    if (DEBUG) {
      warn('Failed to record session information', e);
    }
  }
}

export function terminateSession() {
  vars.sessionId = undefined;

  if (!isSupported) {
    return;
  }

  try {
    removeItem(vars.sessionStorageKey);
  } catch (e) {
    if (DEBUG) {
      info('Failed to terminate session', e);
    }
  }
}
function parseSession(storedValue?: string | null): Session | null {
  if (!storedValue) {
    return null;
  }

  const values = storedValue.split(storageSeparatorKey);
  if (values.length < 3) {
    return null;
  }

  const id = values[0];
  const startTime = parseInt(values[1], 10);
  const lastActivityTime = parseInt(values[2], 10);
  if (!id || isNaN(startTime) || isNaN(lastActivityTime)) {
    return null;
  }

  return {
    id,
    startTime,
    lastActivityTime
  };
}

function serializeSession(session: Session): string {
  return session.id + storageSeparatorKey + session.startTime + storageSeparatorKey + session.lastActivityTime;
}

function isSessionValid(session: Session,
  sessionInactivityTimeoutMillis: number,
  sessionTerminationTimeoutMillis: number): boolean {

  const minAllowedLastActivityTime = now() - sessionInactivityTimeoutMillis;
  if (session.lastActivityTime < minAllowedLastActivityTime) {
    return false;
  }

  const minAllowedStartTime = now() - sessionTerminationTimeoutMillis;
  if (session.startTime < minAllowedStartTime) {
    return false;
  }

  return true;
}
