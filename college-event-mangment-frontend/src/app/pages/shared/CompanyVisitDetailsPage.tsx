import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { companyVisitService, CompanyVisit } from "../../../services/companyVisitService";
import { companyVisitApplicationService } from "../../../services/companyVisitApplicationService";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Calendar, Clock, MapPin, Briefcase, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDate } from "../../../lib/utils";

export function CompanyVisitDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();

  const [visit, setVisit] = useState<CompanyVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const imageUrl = useMemo(() => {
    if (visit?.companyLogoUrl) return visit.companyLogoUrl;
    return "";
  }, [visit?.companyName]);

  const refresh = async () => {
    if (!id) return;
    const data = await companyVisitService.getCompanyVisitById(id);
    setVisit(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        await refresh();

        if (isAuthenticated && isStudent) {
          const myApps = await companyVisitApplicationService.getMyApplications();
          setHasApplied(myApps.some((a) => a.companyVisit._id === id && a.status !== "cancelled"));
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to load company visit");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, isStudent, navigate]);

  const handleApply = async () => {
    if (!id) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isStudent) {
      toast.error("Only students can apply.");
      return;
    }

    setApplying(true);
    try {
      await companyVisitApplicationService.apply(id);
      setHasApplied(true);
      toast.success("Applied successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  }

  if (!visit) {
    return <div className="p-8 text-center">Company visit not found</div>;
  }

  const deadlinePassed = visit.applicationDeadline ? new Date() > new Date(visit.applicationDeadline) : false;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:bg-transparent hover:text-primary">
        ← Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-[40%]">
            <Card className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-purple-600" />
              <div className="overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={visit.companyName} className="h-56 w-full object-cover" />
                ) : (
                  <div className="h-56 w-full bg-muted/10" />
                )}
              </div>
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Placement</Badge>
                  <Badge variant={visit.status === "scheduled" ? "default" : "secondary"} className="capitalize">
                    {visit.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{visit.companyName}</h1>
              <p className="text-muted-foreground mt-2 inline-flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> {visit.jobRole}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{visit.description}</p>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Visit Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(visit.visitDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Visit Time</p>
                      <p className="text-sm text-muted-foreground">{visit.visitTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{visit.venue}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium mb-2 text-sm">Eligibility</h4>
                    <div className="flex flex-wrap gap-2">
                      {visit.eligibility.department.map((d) => (
                        <Badge key={d} variant="secondary" className="text-xs">
                          {d}
                        </Badge>
                      ))}
                      {visit.eligibility.year.map((y) => (
                        <Badge key={y} variant="outline" className="text-xs">
                          Year {y}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">
                        Min CGPA: {visit.eligibility.minCGPA}
                      </Badge>
                    </div>
                  </div>

                  {visit.applicationDeadline && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Deadline:</span> {formatDate(visit.applicationDeadline)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {isStudent && (
                  hasApplied ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-default">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Applied
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={handleApply} disabled={deadlinePassed || applying}>
                      {deadlinePassed ? (
                        <span className="inline-flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" /> Deadline Passed
                        </span>
                      ) : applying ? (
                        "Applying..."
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  )
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
