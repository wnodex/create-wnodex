import { DOMAIN_PATTERN } from './host.js';

/**
 * Regex that validates:
 * 1. Optional subdomains: ([a-z0-9-]+\.)*
 * 2. Any of our domains: (example.com|dashboard.it|...)
 * 3. Optional port: (:[0-9]+)?
 */
export const corsWhitelist = new RegExp(
  String.raw`^https?://([a-z0-9-]+\.)*(?:${DOMAIN_PATTERN})(:[0-9]+)?$`
);
