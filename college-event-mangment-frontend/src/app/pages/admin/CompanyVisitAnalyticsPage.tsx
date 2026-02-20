import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { companyVisitService, CompanyVisit } from "../../../services/companyVisitService";
import { companyVisitApplicationService, CompanyVisitApplication } from "../../../services/companyVisitApplicationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, Briefcase, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export function CompanyVisitAnalyticsPage() {
  const [visits, setVisits] = useState<CompanyVisit[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedVisit, setSelectedVisit] = useState<CompanyVisit | null>(null);
  const [applications, setApplications] = useState<CompanyVisitApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [v, a] = await Promise.all([
          companyVisitService.getCompanyVisits(),
          companyVisitApplicationService.getAnalytics(),
        ]);
        setVisits(v);
        setAnalytics(a);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const stats = useMemo(() => {
    const totalCompanyVisits = analytics?.totalCompanyVisits ?? visits.length;
    const totalApplications = analytics?.totalApplications ?? 0;

    return { totalCompanyVisits, totalApplications };
  }, [analytics, visits]);

  const loadApplications = async (visit: CompanyVisit) => {
    setSelectedVisit(visit);
    setLoadingApplications(true);
    try {
      const apps = await companyVisitApplicationService.getApplicationsForCompanyVisitByAlias(visit._id);
      setApplications(apps);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load applications");
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Company Visit Analytics</h2>
        <p className="text-muted-foreground">Applications and visit trends.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCompanyVisits}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">Applied (active)</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Companies</CardTitle>
                <CardDescription>Click a company to view applicants.</CardDescription>
              </CardHeader>
              <CardContent>
                {visits.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No company visits found.</div>
                ) : (
                  <div className="space-y-2">
                    {visits.map((v) => (
                      <button
                        key={v._id}
                        type="button"
                        onClick={() => loadApplications(v)}
                        className="w-full text-left rounded-md border px-3 py-2 hover:bg-muted/40 transition-colors"
                      >
                        <div className="font-medium truncate">{v.companyName}</div>
                        <div className="text-xs text-muted-foreground">{v.jobRole}</div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{selectedVisit ? `Applicants — ${selectedVisit.companyName}` : "Applicants"}</CardTitle>
                <CardDescription>Detailed student list for the selected company.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingApplications ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !selectedVisit ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">Select a company to view applications.</div>
                ) : applications.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No applications yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Applied Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((a) => (
                        <TableRow key={a._id}>
                          <TableCell className="font-medium">{a.student?.name}</TableCell>
                          <TableCell>{a.student?.email}</TableCell>
                          <TableCell>{(a.student as any)?.department || "-"}</TableCell>
                          <TableCell>{(a.student as any)?.year || "-"}</TableCell>
                          <TableCell>{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
