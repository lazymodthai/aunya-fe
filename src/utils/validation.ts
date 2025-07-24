export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmailRFC = (email: string): boolean => {
  if (!email || email.length > 254) {
    return false;
  }

  // RFC 5322 compliant regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Check if local part doesn't exceed 64 characters
  const [localPart] = email.split('@');
  if (localPart.length > 64) {
    return false;
  }

  // Check domain part constraints
  const domainPart = email.substring(email.lastIndexOf('@') + 1);
  
  // Check for consecutive dots (not allowed in domain)
  if (domainPart.includes('..')) {
    return false;
  }
  
  // Check each domain label
  const labels = domainPart.split('.');
  for (const label of labels) {
    // Each label must start and end with alphanumeric character
    if (!/^[a-zA-Z0-9].*[a-zA-Z0-9]$/.test(label) && label.length > 1) {
      return false;
    }
    
    // Labels cannot be longer than 63 characters
    if (label.length > 63) {
      return false;
    }
    
    // Labels can only contain alphanumeric chars and hyphens
    if (!/^[a-zA-Z0-9\-]+$/.test(label)) {
      return false;
    }
    
    // Hyphens cannot be at start or end of label
    if (label.startsWith('-') || label.endsWith('-')) {
      return false;
    }
  }
  
  return true;
};
