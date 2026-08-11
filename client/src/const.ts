export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local login page. Was previously an external Manus OAuth portal URL;
// replaced with our own standalone email/password login (see Login.tsx).
export const getLoginUrl = () => "/login";
