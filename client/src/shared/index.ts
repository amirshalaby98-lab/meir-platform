/**
 * Shared Layer - Barrel Export
 * 
 * Contains reusable components, hooks, services, and utilities
 * that are shared across multiple features.
 */

// Hooks (re-export from original location)
export { useToast } from "@/hooks/use-toast";
export { useComposition } from "@/hooks/useComposition";
export { useIsMobile } from "@/hooks/useMobile";
export { useNotifications } from "@/hooks/useNotifications";
export { usePersistFn } from "@/hooks/usePersistFn";
export { useQuoteNotifications } from "@/hooks/useQuoteNotifications";

// Lib utilities
export { cn } from "@/lib/utils";
export { trpc } from "@/lib/trpc";

// Services
export { NotificationService } from "@/services/notificationService";
