import vars from './vars';

// Define the structure for page transition data
export interface PageTransitionData {
  d?: number; // Duration for the beacon
}

// Add page transition data to the global vars object
declare module './vars' {
  interface DefaultVars {
    pageTransitionData?: PageTransitionData;
  }
}

// Initialize the pageTransitionData property in vars
vars.pageTransitionData = {};

// Function to set page transition data
export function setPageTransitionData(data: PageTransitionData): void {
  vars.pageTransitionData = data;
}

// Function to get page transition data
export function getPageTransitionData(): PageTransitionData {
  return vars.pageTransitionData || {};
}

// Function to clear page transition data
export function clearPageTransitionData(): void {
  vars.pageTransitionData = {};
}
