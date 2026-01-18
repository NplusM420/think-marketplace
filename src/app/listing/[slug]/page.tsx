import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  FileText,
  Github,
  Clock,
  Bot,
  Wrench,
  AppWindow,
  Cpu,
  Wallet,
  Monitor,
} from "lucide-react";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getListingBySlug, getListingsByBuilder } from "@/lib/data/seed";
import { ListingCard } from "@/components/listing-card";
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

const DEFAULT_ICON = "/thinkos-grey.svg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: listing.name,
    description: listing.short_description,
  };
}

function ThinkFitSection({ listing }: { listing: Listing }) {
  const { think_fit } = listing;
  if (!think_fit) return null;

  const hasSoul = think_fit.soul;
  const hasMind = think_fit.mind;
  const hasBody = think_fit.body;

  if (!hasSoul && !hasMind && !hasBody) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cpu className="h-5 w-5 text-primary" aria-hidden="true" />
          Think Fit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          How this {listing.type} aligns with the Think Agent Standard.
        </p>

        {hasSoul && (
          <div className="rounded-lg border border-border p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-purple-500" aria-hidden="true" />
              <h4 className="font-medium text-foreground">Soul</h4>
              <Badge
                variant="secondary"
                className={cn(
                  "ml-auto text-xs",
                  think_fit.soul?.has_wallet_auth === "yes" &&
                    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
                  think_fit.soul?.has_wallet_auth === "planned" &&
                    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
                  think_fit.soul?.has_wallet_auth === "no" &&
                    "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300"
                )}
              >
                {think_fit.soul?.has_wallet_auth === "yes" && "Wallet Auth ✓"}
                {think_fit.soul?.has_wallet_auth === "planned" && "Planned"}
                {think_fit.soul?.has_wallet_auth === "no" && "No Wallet Auth"}
              </Badge>
            </div>
            {think_fit.soul?.identity_anchor && (
              <p className="text-sm text-muted-foreground">
                {think_fit.soul.identity_anchor}
              </p>
            )}
          </div>
        )}

        {hasMind && (
          <div className="rounded-lg border border-border p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-blue-500" aria-hidden="true" />
              <h4 className="font-medium text-foreground">Mind</h4>
              {think_fit.mind?.mind_runtime && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {think_fit.mind.mind_runtime}
                </Badge>
              )}
            </div>
            {think_fit.mind?.tooling && (
              <p className="text-sm text-muted-foreground">
                {think_fit.mind.tooling}
              </p>
            )}
          </div>
        )}

        {hasBody && (
          <div className="rounded-lg border border-border p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="h-4 w-4 text-green-500" aria-hidden="true" />
              <h4 className="font-medium text-foreground">Body</h4>
              {think_fit.body?.interface_type && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {think_fit.body.interface_type}
                </Badge>
              )}
            </div>
            {think_fit.body?.surfaces && think_fit.body.surfaces.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {think_fit.body.surfaces.map((surface) => (
                  <Badge
                    key={surface}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {surface}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing || listing.review_state !== "approved") {
    notFound();
  }

  const TypeIcon = typeIcons[listing.type];
  const moreFromBuilder = getListingsByBuilder(listing.builder_id).filter(
    (l) => l.id !== listing.id
  );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/browse"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to Browse
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Icon */}
              <div
                className={cn(
                  "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl",
                  "bg-gradient-to-br from-primary/20 to-primary/5"
                )}
                aria-hidden="true"
              >
                <Image
                  src={listing.icon_url || DEFAULT_ICON}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
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
                    {listing.status.charAt(0).toUpperCase() +
                      listing.status.slice(1)}
                  </Badge>
                  {listing.visibility === "featured" && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Featured
                    </Badge>
                  )}
                </div>

                <h1 className="font-body text-3xl font-semibold text-foreground mb-3">
                  {listing.name}
                </h1>

                <p className="text-lg text-muted-foreground mb-4">
                  {listing.short_description}
                </p>

                {/* Builder attribution */}
                {listing.builder && (
                  <Link
                    href={`/builder/${listing.builder.slug}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {listing.builder.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>by {listing.builder.name}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {listing.links.website && (
                <Button asChild>
                  <a
                    href={listing.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="mr-2 h-4 w-4" aria-hidden="true" />
                    Visit Website
                    <ExternalLink className="ml-2 h-3 w-3" aria-hidden="true" />
                  </a>
                </Button>
              )}
              {listing.links.demo && (
                <Button variant="outline" asChild>
                  <a
                    href={listing.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Try Demo
                    <ExternalLink className="ml-2 h-3 w-3" aria-hidden="true" />
                  </a>
                </Button>
              )}
              {listing.links.docs && (
                <Button variant="outline" asChild>
                  <a
                    href={listing.links.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                    Docs
                  </a>
                </Button>
              )}
              {listing.links.repo && (
                <Button variant="outline" asChild>
                  <a
                    href={listing.links.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" aria-hidden="true" />
                    Source
                  </a>
                </Button>
              )}
              {listing.links.waitlist && !listing.links.website && (
                <Button asChild>
                  <a
                    href={listing.links.waitlist}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Waitlist
                    <ExternalLink className="ml-2 h-3 w-3" aria-hidden="true" />
                  </a>
                </Button>
              )}
            </div>

            <Separator />

            {/* Description */}
            {listing.long_description && (
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h2 className="font-body text-xl font-semibold text-foreground mb-4">
                  About
                </h2>
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {listing.long_description}
                </div>
              </div>
            )}

            {/* Tags */}
            {listing.tags.length > 0 && (
              <div>
                <h2 className="font-body text-xl font-semibold text-foreground mb-4">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/browse?search=${encodeURIComponent(tag)}`}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    >
                      <Badge
                        variant="outline"
                        className="hover:bg-accent transition-colors cursor-pointer"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Think Fit */}
            <ThinkFitSection listing={listing} />

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-muted-foreground">Added</p>
                    <p className="font-medium text-foreground">
                      {new Date(listing.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {listing.updated_at !== listing.created_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-muted-foreground">Updated</p>
                      <p className="font-medium text-foreground">
                        {new Date(listing.updated_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Builder card */}
            {listing.builder && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/builder/${listing.builder.slug}`}
                    className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-body text-lg font-semibold">
                        {listing.builder.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {listing.builder.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        View profile →
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* More from builder */}
        {moreFromBuilder.length > 0 && (
          <div className="mt-16">
            <Separator className="mb-8" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-body text-2xl font-semibold text-foreground">
                More from {listing.builder?.name}
              </h2>
              <Link
                href={`/builder/${listing.builder?.slug}`}
                className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {moreFromBuilder.slice(0, 3).map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
