'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Check, X, LogOut, Eye, ExternalLink } from 'lucide-react'

interface PendingListing {
  id: string
  name: string
  slug: string
  type: string
  short_description: string
  long_description?: string
  status: string
  tags: string[]
  links: Record<string, string>
  submitter_wallet: string
  created_at: string
  categories: string[]
  builder?: {
    name: string
    slug: string
    bio?: string
    website?: string
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [adminCode, setAdminCode] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(true)
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null)

  // Check auth status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Fetch pending listings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingListings()
    }
  }, [isAuthenticated])

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
    } catch {
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: adminCode }),
      })

      if (res.ok) {
        setIsAuthenticated(true)
        setAdminCode('')
      } else {
        const data = await res.json()
        setLoginError(data.error || 'Login failed')
      }
    } catch {
      setLoginError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin', { method: 'DELETE' })
    setIsAuthenticated(false)
    setPendingListings([])
  }

  async function fetchPendingListings() {
    try {
      const res = await fetch('/api/admin/pending')
      const data = await res.json()
      setPendingListings(data.listings || [])
    } catch (error) {
      console.error('Failed to fetch pending listings:', error)
    }
  }

  async function handleApprove(id: string, visibility: 'public' | 'featured' = 'public') {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/listings/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility }),
      })

      if (res.ok) {
        setPendingListings(prev => prev.filter(l => l.id !== id))
        setSelectedListing(null)
      }
    } catch (error) {
      console.error('Failed to approve listing:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: string, reason?: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/listings/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (res.ok) {
        setPendingListings(prev => prev.filter(l => l.id !== id))
        setSelectedListing(null)
      }
    } catch (error) {
      console.error('Failed to reject listing:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // Loading state
  if (loading && isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>
              Enter the admin code to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Admin code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                autoFocus
              />
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Think Marketplace Admin</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Review ({pendingListings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingListings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No listings pending review
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {/* Listing list */}
                <div className="space-y-4">
                  {pendingListings.map((listing) => (
                    <Card
                      key={listing.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedListing?.id === listing.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedListing(listing)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">{listing.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {listing.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {listing.short_description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              by {listing.builder?.name || 'Unknown'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApprove(listing.id)
                              }}
                              disabled={actionLoading === listing.id}
                            >
                              {actionLoading === listing.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReject(listing.id)
                              }}
                              disabled={actionLoading === listing.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Detail panel */}
                {selectedListing && (
                  <Card className="sticky top-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{selectedListing.name}</CardTitle>
                        <Badge>{selectedListing.type}</Badge>
                      </div>
                      <CardDescription>
                        Submitted {new Date(selectedListing.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedListing.short_description}
                        </p>
                      </div>

                      {selectedListing.long_description && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Long Description</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {selectedListing.long_description}
                          </p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium mb-1">Builder</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedListing.builder?.name || 'Unknown'}
                          {selectedListing.builder?.website && (
                            <a
                              href={selectedListing.builder.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </p>
                      </div>

                      {selectedListing.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Tags</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedListing.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {Object.keys(selectedListing.links).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Links</h4>
                          <div className="space-y-1">
                            {Object.entries(selectedListing.links).map(([key, url]) => (
                              <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <Eye className="h-3 w-3" />
                                {key}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium mb-1">Submitter</h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          {selectedListing.submitter_wallet}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          className="flex-1"
                          onClick={() => handleApprove(selectedListing.id)}
                          disabled={actionLoading === selectedListing.id}
                        >
                          {actionLoading === selectedListing.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleApprove(selectedListing.id, 'featured')}
                          disabled={actionLoading === selectedListing.id}
                        >
                          Feature
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(selectedListing.id)}
                          disabled={actionLoading === selectedListing.id}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
