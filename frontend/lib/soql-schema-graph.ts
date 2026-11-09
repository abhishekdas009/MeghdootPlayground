export interface SchemaField {
  name: string;
  label: string;
  type: "id" | "string" | "picklist" | "datetime" | "reference" | "boolean" | "number";
  isRelationship?: boolean;
  relationshipName?: string;
  referenceTo?: string;
}

export interface SchemaObject {
  name: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  fields: SchemaField[];
  relationships: {
    name: string;
    targetObject: string;
    relationshipType: "lookup" | "master-detail" | "child";
    field: string;
  }[];
}

export const SALESFORCE_OBJECT_GRAPH: Record<string, SchemaObject> = {
  Case: {
    name: "Case",
    label: "Case (Tickets)",
    description: "Customer service cases and support inquiries",
    color: "#0284c7", // Sky blue
    icon: "Briefcase",
    fields: [
      { name: "Id", label: "Case ID", type: "id" },
      { name: "CaseNumber", label: "Case Number", type: "string" },
      { name: "Status", label: "Status", type: "picklist" },
      { name: "Priority", label: "Priority", type: "picklist" },
      { name: "Subject", label: "Subject", type: "string" },
      { name: "Origin", label: "Case Origin", type: "picklist" },
      { name: "CreatedDate", label: "Created Date", type: "datetime" },
      { name: "ClosedDate", label: "Closed Date", type: "datetime" },
      { name: "ContactId", label: "Contact ID", type: "reference", isRelationship: true, relationshipName: "Contact", referenceTo: "Contact" },
      { name: "AccountId", label: "Account ID", type: "reference", isRelationship: true, relationshipName: "Account", referenceTo: "Account" },
      { name: "AssetId", label: "Asset ID", type: "reference", isRelationship: true, relationshipName: "Asset", referenceTo: "Asset" },
      { name: "OwnerId", label: "Owner ID", type: "reference", isRelationship: true, relationshipName: "Owner", referenceTo: "User" },
      { name: "Ticket_Number_Read_Only__c", label: "Ticket Number (Custom)", type: "string" },
      { name: "Cancellation_Reason__c", label: "Cancellation Reason", type: "string" },
    ],
    relationships: [
      { name: "Contact", targetObject: "Contact", relationshipType: "lookup", field: "ContactId" },
      { name: "Account", targetObject: "Account", relationshipType: "lookup", field: "AccountId" },
      { name: "Asset", targetObject: "Asset", relationshipType: "lookup", field: "AssetId" },
      { name: "WorkOrders", targetObject: "WorkOrder", relationshipType: "child", field: "CaseId" },
    ],
  },
  Contact: {
    name: "Contact",
    label: "Contact (Customer)",
    description: "Individual customer details and phone numbers",
    color: "#8b5cf6", // Violet
    icon: "Users",
    fields: [
      { name: "Id", label: "Contact ID", type: "id" },
      { name: "Name", label: "Full Name", type: "string" },
      { name: "Email", label: "Email Address", type: "string" },
      { name: "Phone", label: "Phone Number", type: "string" },
      { name: "MobilePhone", label: "Mobile Phone", type: "string" },
      { name: "AccountId", label: "Account ID", type: "reference", isRelationship: true, relationshipName: "Account", referenceTo: "Account" },
    ],
    relationships: [
      { name: "Account", targetObject: "Account", relationshipType: "lookup", field: "AccountId" },
      { name: "Cases", targetObject: "Case", relationshipType: "child", field: "ContactId" },
    ],
  },
  Account: {
    name: "Account",
    label: "Account (Dealer / Customer)",
    description: "Customer accounts, dealer channels, or enterprise clients",
    color: "#10b981", // Emerald
    icon: "Building2",
    fields: [
      { name: "Id", label: "Account ID", type: "id" },
      { name: "Name", label: "Account Name", type: "string" },
      { name: "AccountNumber", label: "Account Number", type: "string" },
      { name: "BillingCity", label: "City", type: "string" },
      { name: "BillingState", label: "State", type: "string" },
      { name: "Phone", label: "Account Phone", type: "string" },
    ],
    relationships: [
      { name: "Contacts", targetObject: "Contact", relationshipType: "child", field: "AccountId" },
      { name: "Assets", targetObject: "Asset", relationshipType: "child", field: "AccountId" },
      { name: "Cases", targetObject: "Case", relationshipType: "child", field: "AccountId" },
    ],
  },
  Asset: {
    name: "Asset",
    label: "Asset (Equipment / Unit)",
    description: "Physical HVAC units, outdoor/indoor serial numbers",
    color: "#f59e0b", // Amber
    icon: "Box",
    fields: [
      { name: "Id", label: "Asset ID", type: "id" },
      { name: "Name", label: "Asset Name", type: "string" },
      { name: "SerialNumber", label: "Serial Number", type: "string" },
      { name: "Status", label: "Asset Status", type: "picklist" },
      { name: "InstallDate", label: "Installation Date", type: "datetime" },
      { name: "Product2Id", label: "Product ID", type: "reference", isRelationship: true, relationshipName: "Product2", referenceTo: "Product2" },
      { name: "AccountId", label: "Account ID", type: "reference", isRelationship: true, relationshipName: "Account", referenceTo: "Account" },
      { name: "ContactId", label: "Contact ID", type: "reference", isRelationship: true, relationshipName: "Contact", referenceTo: "Contact" },
    ],
    relationships: [
      { name: "Account", targetObject: "Account", relationshipType: "lookup", field: "AccountId" },
      { name: "Product2", targetObject: "Product2", relationshipType: "lookup", field: "Product2Id" },
      { name: "Cases", targetObject: "Case", relationshipType: "child", field: "AssetId" },
      { name: "WorkOrders", targetObject: "WorkOrder", relationshipType: "child", field: "AssetId" },
    ],
  },
  WorkOrder: {
    name: "WorkOrder",
    label: "WorkOrder (Job / Ticket)",
    description: "Technician work orders, service requests, and maintenance jobs",
    color: "#3b82f6", // Blue
    icon: "Tool",
    fields: [
      { name: "Id", label: "WorkOrder ID", type: "id" },
      { name: "WorkOrderNumber", label: "WorkOrder Number", type: "string" },
      { name: "Status", label: "Status", type: "picklist" },
      { name: "Priority", label: "Priority", type: "picklist" },
      { name: "CaseId", label: "Parent Case ID", type: "reference", isRelationship: true, relationshipName: "Case", referenceTo: "Case" },
      { name: "AssetId", label: "Asset ID", type: "reference", isRelationship: true, relationshipName: "Asset", referenceTo: "Asset" },
      { name: "ContactId", label: "Contact ID", type: "reference", isRelationship: true, relationshipName: "Contact", referenceTo: "Contact" },
      { name: "ParentWorkOrderId", label: "Parent WorkOrder ID", type: "reference", isRelationship: true, relationshipName: "ParentWorkOrder", referenceTo: "WorkOrder" },
      { name: "Ticket_Number_Read_Only__c", label: "Ticket Number (Custom)", type: "string" },
    ],
    relationships: [
      { name: "Case", targetObject: "Case", relationshipType: "lookup", field: "CaseId" },
      { name: "Asset", targetObject: "Asset", relationshipType: "lookup", field: "AssetId" },
      { name: "Contact", targetObject: "Contact", relationshipType: "lookup", field: "ContactId" },
      { name: "ServiceAppointments", targetObject: "ServiceAppointment", relationshipType: "child", field: "ParentRecordId" },
    ],
  },
  ServiceAppointment: {
    name: "ServiceAppointment",
    label: "ServiceAppointment (Visit)",
    description: "Technician field visits, scheduled times, and completion status",
    color: "#ec4899", // Pink
    icon: "Calendar",
    fields: [
      { name: "Id", label: "Appointment ID", type: "id" },
      { name: "AppointmentNumber", label: "Appointment Number", type: "string" },
      { name: "Status", label: "Visit Status", type: "picklist" },
      { name: "SchedStartTime", label: "Scheduled Start", type: "datetime" },
      { name: "SchedEndTime", label: "Scheduled End", type: "datetime" },
      { name: "ActualStartTime", label: "Actual Start", type: "datetime" },
      { name: "ActualEndTime", label: "Actual End", type: "datetime" },
      { name: "ParentRecordId", label: "Parent Record ID", type: "reference" },
      { name: "Ticket_Numbers__c", label: "Ticket Numbers (Custom)", type: "string" },
    ],
    relationships: [
      { name: "ParentWorkOrder", targetObject: "WorkOrder", relationshipType: "lookup", field: "ParentRecordId" },
    ],
  },
};

export function buildSOQLFromSchemaSelection(
  baseObject: string,
  selectedFields: { [objectName: string]: string[] },
  whereClause?: string
): string {
  const fieldsToSelect: string[] = [];

  // Base object fields
  const baseFields = selectedFields[baseObject] || [];
  for (const f of baseFields) {
    fieldsToSelect.push(f);
  }

  // Related object fields (dot notation)
  for (const [objName, fields] of Object.entries(selectedFields)) {
    if (objName === baseObject) continue;
    for (const f of fields) {
      fieldsToSelect.push(`${objName}.${f}`);
    }
  }

  if (fieldsToSelect.length === 0) {
    fieldsToSelect.push("Id");
  }

  const selectStr = fieldsToSelect.join(",\n  ");
  let query = `SELECT\n  ${selectStr}\nFROM ${baseObject}`;

  if (whereClause && whereClause.trim()) {
    query += `\nWHERE ${whereClause.trim()}`;
  }

  return query;
}
