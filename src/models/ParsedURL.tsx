export interface ParsedURL {
  href?: string;
  auth?: string;
  protocol?: string;
  username?: string;
  password?: string;
  host?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  searchParams?: Record<string, string>;
  hash?: string;
  error?: string;
}
