import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { registrationService, Registration } from "../../../services/registrationService";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Loader2, Calendar, MapPin, Trash2 } from "lucide-react";
import { formatDate } from "../../../lib/utils";

export function MyRegisteredEventsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchMy = async () => {
    try {
      setLoading(true);
      const data = await registrationService.getMyRegistrations();
      setRegistrations(data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMy();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registrations.filter((r) => {
      if (!q) return true;
      return (
        r.event.title.toLowerCase().includes(q) ||
        r.event.venue.toLowerCase().includes(q) ||
        r.event.category.toLowerCase().includes(q)
      );
    });
  }, [registrations, query]);

  const cancelRegistration = async (registrationId: string) => {
    if (!confirm("Cancel registration for this event?")) return;

    setCancellingId(registrationId);
    try {
      await registrationService.cancelRegistration(registrationId);
      toast.success("Registration cancelled");
      setRegistrations((prev) => prev.map((r) => (r._id === registrationId ? { ...r, status: "cancelled" } : r)));
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel registration");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Registered Events</h2>
        <p className="text-muted-foreground">View and manage your registrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>Your event registrations (including cancelled).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, venue, category..."
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No registrations found.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((reg) => (
                <Card key={reg._id} className="overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-primary to-purple-600" />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {reg.event.category}
                      </Badge>
                      <Badge
                        variant={
                          reg.status === "registered" ? "default" : reg.status === "cancelled" ? "destructive" : "secondary"
                        }
                        className="capitalize"
                      >
                        {reg.status}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{reg.event.title}</CardTitle>
                    <CardDescription className="space-y-1">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(reg.event.date)}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {reg.event.venue}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link to={`/student/events/${reg.event._id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => cancelRegistration(reg._id)}
                      disabled={reg.status === "cancelled" || cancellingId === reg._id}
                    >
                      {cancellingId === reg._id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Cancel Registration
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
