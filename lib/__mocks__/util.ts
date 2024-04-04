let generateUniqueIdCalls = 0;
const dummyIds = ['a', 'b', 'c', 'd', 'e', 'f'];
export function generateUniqueId() {
  return dummyIds[generateUniqueIdCalls++];
}

let currentNow = 100;
export function setNow(time) {
  currentNow = time;
}

export function now() {
  return currentNow;
}

export function reset() {
  currentNow = 100;
  generateUniqueIdCalls = 0;
}

reset();
