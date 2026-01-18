import Link from "next/link";
import Image from "next/image";
import { Bot, Wrench, AppWindow, ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types";

const typeIcons = {
  agent: Bot,
  tool: Wrench,
  app: AppWindow,
};

const typeColors = {
  agent: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  tool: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  app: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const statusColors = {
  live: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  beta: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  concept: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
};

// Default icon for listings without a custom icon
const DEFAULT_ICON = "/thinkos-grey.svg";

// Placeholder gradient for listings without a thumbnail
const PLACEHOLDER_GRADIENT = "bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20";

interface ListingCardProps {
  listing: Listing;
  featured?: boolean;
}

export function ListingCard({ listing, featured = false }: ListingCardProps) {
  const TypeIcon = typeIcons[listing.type];
  const iconSrc = listing.icon_url || DEFAULT_ICON;

  // Featured cards show thumbnail image on top (like Notion/App Store)
  if (featured) {
    return (
      <Link
        href={`/listing/${listing.slug}`}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      >
        <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50">
          {/* Thumbnail area */}
          <div
            className={cn(
              "relative aspect-[16/10] overflow-hidden",
              !listing.thumbnail_url && PLACEHOLDER_GRADIENT
            )}
          >
            {listing.thumbnail_url ? (
              <Image
                src={listing.thumbnail_url}
                alt={`${listing.name} preview`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              // Placeholder with icon
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={iconSrc}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain opacity-60"
                />
              </div>
            )}
          </div>

          {/* Content below thumbnail */}
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Small icon */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5"
                aria-hidden="true"
              >
                <Image
                  src={iconSrc}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-body text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {listing.name}
                </h3>
                {listing.builder && (
                  <p className="text-xs text-muted-foreground">
                    {listing.builder.name}
                  </p>
                )}
              </div>

              {/* Type badge */}
              <Badge
                variant="secondary"
                className={cn("gap-1 shrink-0", typeColors[listing.type])}
              >
                <TypeIcon className="h-3 w-3" aria-hidden="true" />
                {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mt-3">
              {listing.short_description}
            </p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Standard card layout (no thumbnail)
  return (
    <Link
      href={`/listing/${listing.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
                "bg-gradient-to-br from-primary/20 to-primary/5",
                "group-hover:from-primary/30 group-hover:to-primary/10 transition-colors"
              )}
              aria-hidden="true"
            >
              <Image
                src={iconSrc}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-body text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {listing.name}
                </h3>
                <ExternalLink
                  className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  aria-hidden="true"
                />
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {listing.short_description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn("gap-1", typeColors[listing.type])}
                >
                  <TypeIcon className="h-3 w-3" aria-hidden="true" />
                  {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}
                </Badge>
                <Badge
                  variant="secondary"
                  className={statusColors[listing.status]}
                >
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </Badge>
              </div>

              {/* Builder attribution */}
              {listing.builder && (
                <p className="text-xs text-muted-foreground mt-3">
                  by{" "}
                  <span className="font-medium text-foreground/80">
                    {listing.builder.name}
                  </span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Compact variant for grid displays
export function ListingCardCompact({ listing }: { listing: Listing }) {
  const TypeIcon = typeIcons[listing.type];
  const iconSrc = listing.icon_url || DEFAULT_ICON;

  return (
    <Link
      href={`/listing/${listing.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                "bg-gradient-to-br from-primary/20 to-primary/5"
              )}
              aria-hidden="true"
            >
              <Image
                src={iconSrc}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {listing.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={cn("gap-1 text-xs py-0", typeColors[listing.type])}
                >
                  <TypeIcon className="h-2.5 w-2.5" aria-hidden="true" />
                  {listing.type}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
