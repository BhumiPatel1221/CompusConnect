import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventService, Event } from "../../../services/eventService";
import { registrationService } from "../../../services/registrationService";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle2, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../../../lib/utils";
import { motion } from "motion/react";
import { Textarea } from "../../components/ui/textarea";

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isAdmin } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const refreshEvent = async () => {
    if (!id) return;
    const eventData = await eventService.getEventById(id);
    setEvent(eventData);
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const eventData = await eventService.getEventById(id);
        setEvent(eventData);

        // Check if already registered (for students)
        if (user && isStudent) {
          const isReg = await registrationService.isRegisteredForEvent(id);
          setIsRegistered(isReg);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load event details');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, user, isStudent, navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!event) return <div className="p-8 text-center">Event not found</div>;

  const handleRegister = async () => {
    if (!id) return;

    setRegistering(true);
    try {
      await registrationService.registerForEvent({ eventId: id });
      setIsRegistered(true);
      await refreshEvent();
      toast.success('Successfully registered for event!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your registration?")) return;

    try {
      const registrations = await registrationService.getMyRegistrations();
      const registration = registrations.find(r => r.event._id === id);

      if (registration) {
        await registrationService.cancelRegistration(registration._id);
        setIsRegistered(false);
        await refreshEvent();
        toast.info("Registration cancelled.");
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel registration');
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this event? This action cannot be undone.") || !id) return;

    try {
      await eventService.deleteEvent(id);
      toast.success("Event deleted.");
      navigate("/admin/events");
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete event');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:bg-transparent hover:text-primary">
        ← Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-primary border-primary/20">{event.category}</Badge>
              <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>{event.status}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{event.title}</h1>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-2 text-sm">Eligibility</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.eligibility.department.map(d => (
                      <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                    ))}
                    {event.eligibility.year.map(y => (
                      <Badge key={y} variant="outline" className="text-xs">Year {y}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 shadow-[0_0_15px_-5px_var(--primary)]">
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">{event.venue}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {event.registrationCount} / {event.maxCapacity} Registered
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {isStudent && (
                  isRegistered ? (
                    <div className="w-full space-y-2">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-default">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Registered
                      </Button>
                      <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-destructive" onClick={handleCancel}>
                        Cancel Registration
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={handleRegister} disabled={event.registrationCount >= event.maxCapacity}>
                      {event.registrationCount >= event.maxCapacity ? "Full Capacity" : "Register Now"}
                    </Button>
                  )
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    {event.createdBy.name.charAt(0)}
                  </div>
                  <p className="text-sm font-medium">{event.createdBy.name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
