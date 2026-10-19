function isSalesforceWorkOrderId(val) {
  // WorkOrder IDs in Salesforce always start with 0WO (case-insensitive) and are 15 or 18 chars
  return /^0WO[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?$/i.test(val);
}

function isGeneralSalesforceId(val) {
  return /^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/.test(val);
}

console.log('0WONy000008eHgfOAE is WorkOrder ID:', isSalesforceWorkOrderId('0WONy000008eHgfOAE'));
console.log('B25031925463529 is WorkOrder ID:', isSalesforceWorkOrderId('B25031925463529'));
