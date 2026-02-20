import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { eventService, Event } from "../../../services/eventService";
import { companyVisitService, CompanyVisit } from "../../../services/companyVisitService";
import { registrationService, Registration } from "../../../services/registrationService";
import { companyVisitApplicationService, CompanyVisitApplication } from "../../../services/companyVisitApplicationService";
import { recommendationService, RecommendedEventDto } from "../../../services/recommendationService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar, Users, Briefcase, ArrowRight, Filter, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { formatDate } from "../../../lib/utils";
import { toast } from "sonner";

export function StudentDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedEventDto[]>([]);
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});
  const [upcomingEventsList, setUpcomingEventsList] = useState<Event[]>([]);
  const [eligibleVisitsList, setEligibleVisitsList] = useState<CompanyVisit[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [applications, setApplications] = useState<CompanyVisitApplication[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const [reco, upcoming, visits, regs, apps] = await Promise.all([
          user?._id
            ? recommendationService.getStudentRecommendations(user._id).catch(() => [] as RecommendedEventDto[])
            : Promise.resolve([] as RecommendedEventDto[]),
          eventService.getEvents({ status: "upcoming" }).catch(() => [] as Event[]),
          companyVisitService.getEligibleCompanyVisits().catch(() => [] as CompanyVisit[]),
          registrationService.getMyRegistrations().catch(() => [] as Registration[]),
          companyVisitApplicationService.getMyApplications().catch(() => [] as CompanyVisitApplication[]),
        ]);

        setRecommendations(reco);
        setRecommendedEvents(reco.map((r) => r.event));
        setUpcomingEventsList(upcoming);
        setEligibleVisitsList(visits);
        setRegistrations(regs);
        setApplications(apps);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?._id]);

  const toggleReasons = (eventId: string) => {
    setExpandedReasons((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const registeredCount = useMemo(
    () => registrations.filter((r) => r.status !== "cancelled").length,
    [registrations]
  );
  const upcomingEvents = upcomingEventsList.length;
  const eligibleVisits = eligibleVisitsList.length;

  const allEvents = upcomingEventsList;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link to="/calendar">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
          </Link>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registeredCount}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                Next event in 2 days
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eligible Placements</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eligibleVisits}</div>
              <p className="text-xs text-muted-foreground">
                3 new companies added
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="bg-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Profile Status</CardTitle>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Active</div>
              <p className="text-xs text-primary/70">
                Data up to date
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="flex justify-center">
        <Card className="w-full max-w-5xl">
          <CardHeader>
            <CardTitle>Recommended For You</CardTitle>
            <CardDescription>
              Based on your department ({user?.department}) and interests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
              ) : recommendedEvents.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No recommendations yet.</div>
              ) : (
                recommendedEvents.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{event.title}</p>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                        {(() => {
                          const rec = recommendations.find((r) => String(r.eventId) === String(event._id));
                          if (!rec) return null;
                          return (
                            <Badge variant="outline" className="text-xs">{rec.matchScore}%</Badge>
                          );
                        })()}
                        <span>{formatDate(event.date)}</span>
                      </div>

                      {(() => {
                        const rec = recommendations.find((r) => String(r.eventId) === String(event._id));
                        if (!rec || !rec.reasons?.length) return null;
                        const isOpen = !!expandedReasons[event._id];
                        return (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => toggleReasons(event._id)}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              Why Recommended?
                            </button>
                            {isOpen && (
                              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                {rec.reasons.map((reason, idx) => (
                                  <div key={idx}>{reason}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <Link to={`/student/events/${event._id}`}>
                      <Button variant="ghost" size="sm">
                        View <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Browse Events</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center text-sm text-muted-foreground py-10">Loading...</div>
          ) : allEvents.length === 0 ? (
            <div className="col-span-full text-center text-sm text-muted-foreground py-10">No upcoming events found.</div>
          ) : (
            allEvents.slice(0, 6).map((event) => (
              <Card key={event._id} className="overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-primary to-purple-600" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2">{event.category}</Badge>
                    <span className={`text-xs px-2 py-1 rounded-full ${event.status === 'upcoming' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {event.status}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Clock className="mr-1 h-3 w-3" /> {formatDate(event.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>{event.venue}</span>
                    <span>{event.registrationCount}{event.maxCapacity ? `/${event.maxCapacity}` : ""} Reg</span>
                  </div>
                  <Link to={`/student/events/${event._id}`}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
