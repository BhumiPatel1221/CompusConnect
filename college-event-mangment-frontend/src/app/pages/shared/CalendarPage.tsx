import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { eventService, Event } from "../../../services/eventService";
import { companyVisitService, CompanyVisit } from "../../../services/companyVisitService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Calendar as DayCalendar } from "../../components/ui/calendar";
import { Loader2 } from "lucide-react";
import { formatDate } from "../../../lib/utils";

type CalendarItem =
  | { type: "event"; id: string; title: string; date: Date; meta: { location: string } }
  | { type: "visit"; id: string; title: string; date: Date; meta: { location: string } };

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [visits, setVisits] = useState<CompanyVisit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ev, cv] = await Promise.all([
          eventService.getEvents().catch(() => [] as Event[]),
          companyVisitService.getCompanyVisits().catch(() => [] as CompanyVisit[]),
        ]);
        setEvents(ev);
        setVisits(cv);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load calendar");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const items: CalendarItem[] = useMemo(() => {
    const eventItems: CalendarItem[] = events.map((e) => ({
      type: "event",
      id: e._id,
      title: e.title,
      date: new Date(e.date),
      meta: { location: e.venue },
    }));

    const visitItems: CalendarItem[] = visits.map((v) => ({
      type: "visit",
      id: v._id,
      title: v.companyName,
      date: new Date(v.visitDate),
      meta: { location: v.venue },
    }));

    return [...eventItems, ...visitItems];
  }, [events, visits]);

  const selectedItems = useMemo(() => {
    if (!selectedDate) return [];
    return items
      .filter((i) => sameDay(i.date, selectedDate))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [items, selectedDate]);

  const modifiers = useMemo(() => {
    const withItems = items.map((i) => i.date);
    return { withItems };
  }, [items]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
        <p className="text-muted-foreground">Events and company visits scheduled by date.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Pick a Date</CardTitle>
              <CardDescription>Days with items are highlighted.</CardDescription>
            </CardHeader>
            <CardContent>
              <DayCalendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={modifiers as any}
                modifiersClassNames={{
                  withItems: "bg-primary/10 text-primary rounded-md",
                }}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                {selectedDate ? `Items on ${formatDate(selectedDate)}` : "Select a date"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedItems.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No items scheduled.</div>
              ) : (
                selectedItems.map((i) => (
                  <div
                    key={`${i.type}-${i.id}`}
                    className="flex flex-col gap-2 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={i.type === "event" ? "default" : "secondary"} className="capitalize">
                          {i.type === "event" ? "Event" : "Company Visit"}
                        </Badge>
                      </div>
                      <p className="font-medium leading-none">{i.title}</p>
                      <p className="text-sm text-muted-foreground">{i.meta.location}</p>
                    </div>

                    <div>
                      {i.type === "event" ? (
                        <Link to={`/student/events/${i.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      ) : (
                        <Link to={`/company/${i.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
