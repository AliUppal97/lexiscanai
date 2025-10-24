/**
 * LexiScan AI - Enterprise Dashboard Components Library
 * 
 * A comprehensive collection of production-ready dashboard components for
 * enterprise SaaS applications. Built with React, TypeScript, and Tailwind CSS.
 * 
 * @module dashboard
 * @author LexiScan AI Team
 * @since 1.0.0
 */

// ============================================================================
// STATISTICS CARD - Metrics Display
// ============================================================================

export {
  StatisticsCard,
  StatisticsCardGrid,
  StatisticsCardSkeleton,
  DocumentStatsCard,
  UserStatsCard,
  RevenueStatsCard,
  ActivityStatsCard,
  type StatisticsCardProps,
  type TrendType,
} from "./StatisticsCard"

// ============================================================================
// ACTIVITY FEED - Recent Activities Timeline
// ============================================================================

export {
  ActivityFeed,
  ActivityFeedSkeleton,
  CompactActivityFeed,
  type ActivityFeedProps,
  type Activity,
  type ActivityType,
} from "./ActivityFeed"

// ============================================================================
// QUICK ACTIONS - Common Task Buttons
// ============================================================================

export {
  QuickActions,
  CompactQuickActions,
  DocumentActions,
  TeamActions,
  type QuickActionsProps,
  type QuickAction,
} from "./QuickActions"

// ============================================================================
// SEARCH BAR - Global Search
// ============================================================================

export {
  SearchBar,
  type SearchBarProps,
  type SearchResult,
} from "./SearchBar"

// ============================================================================
// DOCUMENT LIST - Document Grid/List View
// ============================================================================

export {
  DocumentList,
  type DocumentListProps,
  type Document,
} from "./DocumentList"

// ============================================================================
// NOTIFICATION CENTER - Notification Panel
// ============================================================================

export {
  NotificationCenter,
  type NotificationCenterProps,
  type Notification,
} from "./NotificationCenter"

// ============================================================================
// TEAM MEMBERS - Team Overview
// ============================================================================

export {
  TeamMembers,
  type TeamMembersProps,
  type TeamMember,
} from "./TeamMembers"

// ============================================================================
// RECENT DOCUMENTS - Recent Files List
// ============================================================================

export {
  RecentDocuments,
  type RecentDocumentsProps,
  type RecentDocument,
} from "./RecentDocuments"
