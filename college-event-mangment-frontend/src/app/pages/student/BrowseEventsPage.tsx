import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { eventService, Event } from "../../../services/eventService";
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
import { toast } from "sonner";
import { Loader2, Clock, MapPin } from "lucide-react";
import { formatDate } from "../../../lib/utils";

const CATEGORIES: Array<Event["category"] | "all"> = [
  "all",
  "technical",
  "cultural",
  "sports",
  "placement",
];

export function BrowseEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEvents({ status: "upcoming" });
        setEvents(data);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load upcoming events");
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, []);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();

    return events.filter((e) => {
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q);

      const matchesCategory = category === "all" ? true : e.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [events, query, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Browse Events</h2>
          <p className="text-muted-foreground">Discover upcoming campus events and register in one click.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Search and filter events by category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, venue..."
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
          ) : filteredEvents.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No upcoming events found.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden group">
                    <div className="h-2 bg-gradient-to-r from-primary to-purple-600" />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2 capitalize">
                          {event.category}
                        </Badge>
                        <Badge variant="default" className="capitalize">
                          {event.status}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="mr-1 h-3 w-3" /> {formatDate(event.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.venue}
                        </span>
                        <span>
                          {event.registrationCount}
                          {event.maxCapacity ? `/${event.maxCapacity}` : ""} Reg
                        </span>
                      </div>
                      <Link to={`/student/events/${event._id}`}>
                        <Button className="w-full group-hover:bg-primary/90 transition-colors">View Details</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
