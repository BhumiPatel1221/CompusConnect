import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../../services/authService";
import { eventService, Event } from "../../../services/eventService";
import { companyVisitService, CompanyVisit } from "../../../services/companyVisitService";
import { registrationService, Registration } from "../../../services/registrationService";
import { companyVisitApplicationService, CompanyVisitApplication } from "../../../services/companyVisitApplicationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Loader2, Mail, GraduationCap, Building2, CalendarDays } from "lucide-react";
import { formatDate } from "../../../lib/utils";

const profileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  department: z.string().optional(),
  year: z.string().optional(),
  interests: z.string().optional(),
  organization: z.string().optional(),
  position: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user, updateUser, isStudent, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [createdVisits, setCreatedVisits] = useState<CompanyVisit[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [applications, setApplications] = useState<CompanyVisitApplication[]>([]);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema) as any,
    mode: "onBlur",
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      department: user?.department || "",
      year: user?.year || "",
      interests: (user?.interests || []).join(", "),
      organization: user?.organization || "",
      position: user?.position || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: user?.name || "",
      email: user?.email || "",
      department: user?.department || "",
      year: user?.year || "",
      interests: (user?.interests || []).join(", "),
      organization: user?.organization || "",
      position: user?.position || "",
    });
  }, [user]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const latest = await authService.getCurrentUser();
        updateUser(latest);

        if (isStudent) {
          const [regs, apps] = await Promise.all([
            registrationService.getMyRegistrations(),
            companyVisitApplicationService.getMyApplications(),
          ]);
          setRegistrations(regs);
          setApplications(apps);
        }

        if (isAdmin) {
          const [events, visits] = await Promise.all([
            eventService.getEvents(),
            companyVisitService.getCompanyVisits(),
          ]);
          setCreatedEvents(events.filter((e) => e.createdBy?._id === latest._id));
          setCreatedVisits(visits.filter((v) => v.createdBy?._id === latest._id));
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?._id, isStudent, isAdmin]);

  const onSubmit = async (values: ProfileValues) => {
    try {
      setSaving(true);
      const interests = values.interests
        ? values.interests
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const updated = await authService.updateProfile({
        name: values.name,
        email: values.email,
        department: isStudent ? values.department : undefined,
        year: isStudent ? values.year : undefined,
        interests: isStudent ? interests : undefined,
        organization: isAdmin ? values.organization : undefined,
        position: isAdmin ? values.position : undefined,
      });
      updateUser(updated);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const studentSummary = useMemo(() => {
    const activeRegs = registrations.filter((r) => r.status !== "cancelled");
    const activeApps = applications.filter((a) => a.status !== "cancelled");

    return {
      registeredEvents: activeRegs.length,
      appliedVisits: activeApps.length,
    };
  }, [registrations, applications]);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your account details and activity.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Your basic information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                  {isStudent && user.department && (
                    <Badge variant="secondary">{user.department}</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>

                {isStudent && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>
                        {user.department} · Year {user.year}
                      </span>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>Admin Account</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your name.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...form.register("name")} />
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...form.register("email")} />
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  {isStudent && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" {...form.register("department")} />
                        {form.formState.errors.department && (
                          <p className="text-xs text-destructive">{form.formState.errors.department.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input id="year" {...form.register("year")} />
                        {form.formState.errors.year && (
                          <p className="text-xs text-destructive">{form.formState.errors.year.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interests">Interests</Label>
                        <Input id="interests" placeholder="e.g. AI, Web, Data" {...form.register("interests")} />
                        {form.formState.errors.interests && (
                          <p className="text-xs text-destructive">{form.formState.errors.interests.message}</p>
                        )}
                      </div>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Input id="organization" {...form.register("organization")} />
                        {form.formState.errors.organization && (
                          <p className="text-xs text-destructive">{form.formState.errors.organization.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" {...form.register("position")} />
                        {form.formState.errors.position && (
                          <p className="text-xs text-destructive">{form.formState.errors.position.message}</p>
                        )}
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {isStudent && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Registered Events</CardTitle>
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{studentSummary.registeredEvents}</div>
                      <p className="text-xs text-muted-foreground">Active registrations</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Applied Visits</CardTitle>
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{studentSummary.appliedVisits}</div>
                      <p className="text-xs text-muted-foreground">Active applications</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Registered Events</CardTitle>
                    <CardDescription>Your latest registrations.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {registrations.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">No registrations yet.</div>
                    ) : (
                      registrations.slice(0, 6).map((reg) => (
                        <div key={reg._id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-1">
                            <p className="font-medium leading-none">{reg.event.title}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(reg.event.date)} · {reg.event.venue}</p>
                          </div>
                          <Badge
                            variant={
                              reg.status === "registered" ? "default" : reg.status === "cancelled" ? "destructive" : "secondary"
                            }
                            className="capitalize"
                          >
                            {reg.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Applied Company Visits</CardTitle>
                    <CardDescription>Your latest applications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {applications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">No applications yet.</div>
                    ) : (
                      applications.slice(0, 6).map((app) => (
                        <div key={app._id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-1">
                            <p className="font-medium leading-none">{app.companyVisit.companyName}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(app.companyVisit.visitDate)} · {app.companyVisit.venue}</p>
                          </div>
                          <Badge
                            variant={app.status === "applied" ? "default" : "destructive"}
                            className="capitalize"
                          >
                            {app.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {isAdmin && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Created Events</CardTitle>
                    <CardDescription>Events you created.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {createdEvents.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">No events created yet.</div>
                    ) : (
                      createdEvents.slice(0, 8).map((e) => (
                        <div key={e._id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-1">
                            <p className="font-medium leading-none">{e.title}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(e.date)} · {e.venue}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">{e.status}</Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Created Company Visits</CardTitle>
                    <CardDescription>Placement drives you created.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {createdVisits.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">No company visits created yet.</div>
                    ) : (
                      createdVisits.slice(0, 8).map((v) => (
                        <div key={v._id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-1">
                            <p className="font-medium leading-none">{v.companyName}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(v.visitDate)} · {v.venue}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">{v.status}</Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
