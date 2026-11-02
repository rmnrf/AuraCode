/**
 * Aura Gateway TUI Integration
 *
 * This module provides TUI-specific functionality for aura-gateway.
 * It requires OpenCode TUI dependencies to be injected at runtime.
 *
 * Import from "@auracode/aura-gateway/tui" for TUI features.
 */

// ============================================================================
// TUI Dependency Injection
// ============================================================================
export { initializeTUIDependencies, getTUIDependencies, areTUIDependenciesInitialized } from "./tui/context.js"
export type { TUIDependencies } from "./tui/types.js"

// ============================================================================
// TUI Helpers
// ============================================================================
export { formatProfileInfo, getOrganizationOptions, getDefaultOrganizationSelection } from "./tui/helpers.js"

// ============================================================================
// NOTE: TUI Components Moved to OpenCode
// ============================================================================
// All TUI components with JSX have been moved to packages/opencode/src/auracode/
// to ensure correct JSX transpilation with @opentui/solid.
//
// Components moved:
// - registerAuraCommands -> @/auracode/aura-commands
// - DialogAuraTeamSelect -> @/auracode/components/dialog-aura-team-select
// - DialogAuraOrganization -> @/auracode/components/dialog-aura-organization
// - DialogAuraProfile -> @/auracode/components/dialog-aura-profile
// - AuraAutoMethod -> @/auracode/components/dialog-aura-auto-method
// - AuraNews -> @/auracode/components/aura-news
// - NotificationBanner -> @/auracode/components/notification-banner
// - DialogAuraNotifications -> @/auracode/components/dialog-aura-notifications
