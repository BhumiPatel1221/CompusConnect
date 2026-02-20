import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminService, AdminStats } from "../../../services/adminService";
import { companyVisitApplicationService, CompanyVisitApplication } from "../../../services/companyVisitApplicationService";
import { registrationService, Registration } from "../../../services/registrationService";
import { eventService, Event } from "../../../services/eventService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Calendar, Users, Briefcase, PlusCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export function AdminDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventRegistrations, setEventRegistrations] = useState<Registration[]>([]);
  const [loadingEventRegistrations, setLoadingEventRegistrations] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [s, ev] = await Promise.all([
          adminService.getStats(),
          eventService.getEvents(),
        ]);
        setStats(s);
        setEvents(ev);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const ev = await eventService.getEvents();
        setEvents(ev);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load events");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const loadRegistrationsForEvent = async (event: Event) => {
    setSelectedEvent(event);
    setLoadingEventRegistrations(true);
    try {
      const regs = await registrationService.getEventRegistrationsByAlias(event._id);
      setEventRegistrations(regs);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load registrations");
      setEventRegistrations([]);
    } finally {
      setLoadingEventRegistrations(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Console</h2>
          <p className="text-muted-foreground">Overview of campus activities and metrics.</p>
        </div>
        <div className="flex items-center space-x-2">
           <Link to="/admin/events/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
           </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalEvents ?? 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalRegistrations ?? 0}</div>
                <p className="text-xs text-muted-foreground">Active registrations</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Visits</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalCompanyVisits ?? 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Event Registrations Details</CardTitle>
            <CardDescription>Click an event to view registered students.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEvents ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : events.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No events found.</div>
            ) : (
              <div className="space-y-2">
                {events.map((e) => (
                  <button
                    key={e._id}
                    type="button"
                    onClick={() => loadRegistrationsForEvent(e)}
                    className="w-full text-left rounded-md border px-3 py-2 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{e.title}</span>
                      <span className="text-xs text-muted-foreground">{e.registrationCount ?? 0}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.date ? new Date(e.date).toLocaleDateString() : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{selectedEvent ? `Students — ${selectedEvent.title}` : "Students"}</CardTitle>
            <CardDescription>Detailed list of registrations for the selected event.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEventRegistrations ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !selectedEvent ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Select an event to view registrations.</div>
            ) : eventRegistrations.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No registrations yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventRegistrations.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className="font-medium">{r.student?.name}</TableCell>
                      <TableCell>{r.student?.email}</TableCell>
                      <TableCell>{(r.student as any)?.department || "-"}</TableCell>
                      <TableCell>{(r.student as any)?.year || "-"}</TableCell>
                      <TableCell>{r.registrationDate ? new Date(r.registrationDate).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
