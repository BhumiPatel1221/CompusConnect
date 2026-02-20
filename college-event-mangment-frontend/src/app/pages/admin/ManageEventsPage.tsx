import React, { useEffect, useMemo, useState } from "react";
import { eventService, Event, UpdateEventData } from "../../../services/eventService";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";

const CATEGORIES: Array<Event["category"] | "all"> = [
  "all",
  "technical",
  "cultural",
  "sports",
  "placement",
];

function getStatusBadgeVariant(status: Event["status"]) {
  if (status === "upcoming") return "default";
  if (status === "completed") return "secondary";
  if (status === "cancelled") return "destructive";
  return "outline";
}

export function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");

  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editValues, setEditValues] = useState<UpdateEventData>({});

  const fetchEvents = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();

    return events.filter((e) => {
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q);

      const matchesCategory = category === "all" ? true : e.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [events, query, category]);

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setEditValues({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date?.slice(0, 10),
      time: event.time,
      venue: event.venue,
      status: event.status,
      maxCapacity: event.maxCapacity ?? undefined,
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editingEvent) return;

    try {
      setEditSaving(true);
      await eventService.updateEvent(editingEvent._id, editValues);
      toast.success("Event updated successfully");
      setEditOpen(false);
      setEditingEvent(null);
      await fetchEvents(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update event");
    } finally {
      setEditSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      toast.success("Event deleted");
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete event");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Events</h2>
          <p className="text-muted-foreground">Search, filter, edit, and manage campus events.</p>
        </div>
        <Button variant="outline" onClick={() => fetchEvents(true)} disabled={refreshing}>
          {refreshing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>All events created in the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, venue, category..."
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No events found.</div>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event._id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {event.category}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(event.status)} className="capitalize">
                          {event.status}
                        </Badge>
                      </div>
                      <p className="font-medium leading-none">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.venue} · {new Date(event.date).toLocaleDateString()} · {event.time}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(event)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the event and related
                              registrations.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteEvent(event._id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details. Changes are saved immediately.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Event Title</Label>
              <Input
                id="edit-title"
                value={editValues.title ?? ""}
                onChange={(e) => setEditValues((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-venue">Location</Label>
              <Input
                id="edit-venue"
                value={editValues.venue ?? ""}
                onChange={(e) => setEditValues((p) => ({ ...p, venue: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={(editValues.date as string) ?? ""}
                  onChange={(e) => setEditValues((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Time</Label>
                <Input
                  type="text"
                  value={editValues.time ?? ""}
                  onChange={(e) => setEditValues((p) => ({ ...p, time: e.target.value }))}
                  placeholder="10:00 AM"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={(editValues.category as any) ?? "technical"}
                  onValueChange={(v) => setEditValues((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "all").map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={(editValues.status as any) ?? "upcoming"}
                  onValueChange={(v) => setEditValues((p) => ({ ...p, status: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["upcoming", "ongoing", "completed", "cancelled"] as const).map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={editSaving}>
              {editSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
