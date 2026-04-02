import { PROD } from './prod.js';

/**
 * List of allowed hostnames and their extentions for CORS and other host-based checks.
 */
export const ALLOWED_HOSTS = [
  // TODO: change me to your actual domain(s) and uncomment the line below
  { name: 'example', ext: 'com' },
  // { name: 'example', ext: 'local' },
];

const domainList = ALLOWED_HOSTS
  .map(host => `${host.name}\\.${host.ext}`)
  .join('|');

const localList = ALLOWED_HOSTS
  .map(host => `${host.name}\\.local`)
  .join('|');

/**
 * Combined regex pattern for all domains.
 * In production: supports www and the list of domains.
 * In dev: supports www, .local variants, and localhost.
 */
export const DOMAIN_PATTERN = PROD
  ? `(?:www\\.)?(?:${domainList})`
  : `(?:www\\.)?(?:${domainList}|${localList})|localhost`;
