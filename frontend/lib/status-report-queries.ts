export interface StatusReportQueryItem {
  id?: string;
  key: string;
  name: string;
  soql: string;
  updatedAt?: string;
}

export const DEFAULT_STATUS_REPORT_QUERIES: Record<
  "closed_cases" | "other_status_cases",
  StatusReportQueryItem
> = {
  closed_cases: {
    key: "closed_cases",
    name: "Completed / Closed Cases",
    soql: `SELECT
    CaseNumber,
     Owner.Name,
    
    Subject, 
    Status,Account.Name
FROM Case
WHERE
    Status = 'Closed'
    AND ClosedDate = Today
    AND OwnerId IN (
        '005Ny00000QgwYTIAZ',
        '005Ny00000SHAKcIAP',
        '005Ny00000R1Nr3IAF',
        '005Ny00000RVhYzIAL',
        '005Ny00000Ab3R1IAJ',
        '005Ny00000Ab3QzIAJ',
        '005Ny00000Ab3R0IAJ',
        '005Ny00000Ab3R2IAJ',
        '005Ny00000Ab3R5IAJ',
        '005Ny00000Ab3R4IAJ',
        '005Ny00000Ab3R3IAJ'
    )
ORDER BY Owner.Name, ClosedDate`,
  },
  other_status_cases: {
    key: "other_status_cases",
    name: "Other Status Cases",
    soql: `SELECT 
    CaseNumber,
     Owner.Name,
    
    Subject, 
    Status,Account.Name FROM Case WHERE CreatedDate <= Today AND Status IN ( 'Pending', 'Waiting User Info', 'Open', 'Resolved', 'In Progress','Autoclose','Internal Clarification' ) AND OwnerId IN (  '005Ny00000QgwYTIAZ', '005Ny00000SHAKcIAP', '005Ny00000R1Nr3IAF', '005Ny00000RVhYzIAL', '005Ny00000Ab3R1IAJ', '005Ny00000Ab3QzIAJ', '005Ny00000Ab3R0IAJ', '005Ny00000Ab3R2IAJ', '005Ny00000Ab3R5IAJ', '005Ny00000Ab3R4IAJ', '005Ny00000Ab3R3IAJ','00GNy000009qbJFMAY' ) and RecordType.Name = 'Salesforce System Support' ORDER BY Owner.Name, Status`,
  },
};

const STORAGE_PREFIX = "meghdoot_status_query_";

export function getLocalStoredQuery(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    return null;
  }
}

export function setLocalStoredQuery(key: string, soql: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, soql);
  } catch {
    // Ignore storage errors
  }
}
