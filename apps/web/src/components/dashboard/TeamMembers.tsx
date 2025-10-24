"use client"

import * as React from "react"
import { Users, MoreVertical, Mail, UserMinus, UserPlus, Crown, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * TeamMembers - Enterprise team overview component
 * 
 * Displays team members with roles, status, and actions.
 * Perfect for team dashboards and member management.
 * 
 * Features:
 * - Member avatars
 * - Role badges
 * - Online status
 * - Member actions
 * - Grid/list layouts
 * - Invite button
 * 
 * @example
 * <TeamMembers
 *   members={teamMembers}
 *   onMemberClick={(member) => navigate(`/team/${member.id}`)}
 *   onInvite={() => openInviteDialog()}
 * />
 */

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: "owner" | "admin" | "member" | "viewer"
  status: "online" | "offline" | "away"
  joinedAt?: Date | string
  lastActive?: Date | string
}

export interface TeamMembersProps {
  members: TeamMember[]
  currentUserId?: string
  isLoading?: boolean
  onMemberClick?: (member: TeamMember) => void
  onInvite?: () => void
  onRemove?: (member: TeamMember) => void
  onChangeRole?: (member: TeamMember, role: string) => void
  onMessage?: (member: TeamMember) => void
  layout?: "grid" | "list"
  maxDisplay?: number
  showActions?: boolean
  title?: string
  description?: string
  className?: string
}

export function TeamMembers({
  members,
  currentUserId,
  isLoading = false,
  onMemberClick,
  onInvite,
  onRemove,
  onChangeRole,
  onMessage,
  layout = "grid",
  maxDisplay,
  showActions = true,
  title = "Team Members",
  description,
  className,
}: TeamMembersProps) {
  const displayMembers = maxDisplay ? members.slice(0, maxDisplay) : members
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {onInvite && (
            <Button onClick={onInvite} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          layout === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <TeamMemberSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <TeamMemberSkeleton key={i} />
              ))}
            </div>
          )
        ) : displayMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No team members</p>
            {onInvite && (
              <Button onClick={onInvite} className="mt-4">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            )}
          </div>
        ) : layout === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                isCurrentUser={currentUserId === member.id}
                onClick={onMemberClick}
                onRemove={onRemove}
                onChangeRole={onChangeRole}
                onMessage={onMessage}
                showActions={showActions}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {displayMembers.map((member) => (
              <TeamMemberListItem
                key={member.id}
                member={member}
                isCurrentUser={currentUserId === member.id}
                onClick={onMemberClick}
                onRemove={onRemove}
                onChangeRole={onChangeRole}
                onMessage={onMessage}
                showActions={showActions}
              />
            ))}
          </div>
        )}
        
        {maxDisplay && members.length > maxDisplay && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View all {members.length} members
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * TeamMemberCard - Grid view item
 */

interface TeamMemberCardProps {
  member: TeamMember
  isCurrentUser?: boolean
  onClick?: (member: TeamMember) => void
  onRemove?: (member: TeamMember) => void
  onChangeRole?: (member: TeamMember, role: string) => void
  onMessage?: (member: TeamMember) => void
  showActions?: boolean
}

function TeamMemberCard({
  member,
  isCurrentUser,
  onClick,
  onRemove,
  onChangeRole,
  onMessage,
  showActions,
}: TeamMemberCardProps) {
  const RoleIcon = getRoleIcon(member.role)
  
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center gap-3 rounded-lg border p-4 transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/50"
      )}
      onClick={() => onClick?.(member)}
    >
      {showActions && !isCurrentUser && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onMessage && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMessage(member) }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
              )}
              {onChangeRole && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeRole(member, "admin") }}>
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeRole(member, "member") }}>
                    Make Member
                  </DropdownMenuItem>
                </>
              )}
              {onRemove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onRemove(member) }}
                    className="text-destructive"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      {/* Avatar with status */}
      <div className="relative">
        <Avatar className="h-16 w-16">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback>
            {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background",
          member.status === "online" && "bg-green-500",
          member.status === "away" && "bg-yellow-500",
          member.status === "offline" && "bg-gray-400"
        )} />
      </div>
      
      {/* Name & Email */}
      <div className="text-center w-full">
        <div className="flex items-center justify-center gap-2">
          <p className="font-medium truncate">{member.name}</p>
          {isCurrentUser && <Badge variant="outline" className="text-xs">You</Badge>}
        </div>
        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
      </div>
      
      {/* Role Badge */}
      <Badge variant={getRoleVariant(member.role)} className="flex items-center gap-1">
        <RoleIcon className="h-3 w-3" />
        {member.role}
      </Badge>
    </div>
  )
}

/**
 * TeamMemberListItem - List view item
 */

function TeamMemberListItem({
  member,
  isCurrentUser,
  onClick,
  onRemove,
  onChangeRole,
  onMessage,
  showActions,
}: TeamMemberCardProps) {
  const RoleIcon = getRoleIcon(member.role)
  
  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-lg border p-3 transition-all",
        onClick && "cursor-pointer hover:shadow-sm hover:border-primary/50"
      )}
      onClick={() => onClick?.(member)}
    >
      {/* Avatar with status */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback>
            {member.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
          member.status === "online" && "bg-green-500",
          member.status === "away" && "bg-yellow-500",
          member.status === "offline" && "bg-gray-400"
        )} />
      </div>
      
      {/* Name & Email */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{member.name}</p>
          {isCurrentUser && <Badge variant="outline" className="text-xs">You</Badge>}
        </div>
        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
      </div>
      
      {/* Role Badge */}
      <Badge variant={getRoleVariant(member.role)} className="flex items-center gap-1 flex-shrink-0">
        <RoleIcon className="h-3 w-3" />
        {member.role}
      </Badge>
      
      {/* Actions */}
      {showActions && !isCurrentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onMessage && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMessage(member) }}>
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </DropdownMenuItem>
            )}
            {onChangeRole && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeRole(member, "admin") }}>
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeRole(member, "member") }}>
                  Make Member
                </DropdownMenuItem>
              </>
            )}
            {onRemove && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onRemove(member) }}
                  className="text-destructive"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

function getRoleIcon(role: string) {
  switch (role) {
    case "owner":
      return Crown
    case "admin":
      return Shield
    default:
      return Users
  }
}

function getRoleVariant(role: string): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "owner":
      return "default"
    case "admin":
      return "secondary"
    default:
      return "outline"
  }
}

function TeamMemberSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border p-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2 text-center w-full">
        <Skeleton className="h-4 w-24 mx-auto" />
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  )
}

