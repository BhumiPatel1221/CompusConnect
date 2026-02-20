import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { companyVisitService, CompanyVisit } from "../../../services/companyVisitService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Briefcase, Calendar, MapPin, DollarSign, Clock } from "lucide-react";
import { formatDate } from "../../../lib/utils";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function CompanyVisitsPage() {
  const { isStudent, isAdmin } = useAuth();

  const [visits, setVisits] = useState<CompanyVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        const data = await companyVisitService.getCompanyVisits();
        setVisits(data);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load company visits");
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, []);

  const sortedVisits = useMemo(() => {
    return [...visits].sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
  }, [visits]);
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Placement Drives</h2>
          <p className="text-muted-foreground">Upcoming campus recruitment opportunities.</p>
        </div>
        {isAdmin && (
           <Link to="/admin/placements/create">
             <Button>Add Visit</Button>
           </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center text-sm text-muted-foreground py-10">Loading...</div>
        ) : sortedVisits.length === 0 ? (
          <div className="col-span-full text-center text-sm text-muted-foreground py-10">No company visits found.</div>
        ) : (
        sortedVisits.map((visit, index) => (
          <motion.div
            key={visit._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                   <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
                      {visit.companyLogoUrl ? (
                        <img src={visit.companyLogoUrl} alt={visit.companyName} className="h-full w-full object-cover" />
                      ) : (
                        visit.companyName.charAt(0)
                      )}
                   </div>
                   <Badge variant={visit.status === 'scheduled' ? 'default' : 'secondary'}>{visit.status}</Badge>
                </div>
                <CardTitle className="text-xl">{visit.companyName}</CardTitle>
                <CardDescription className="text-base font-medium text-foreground">{visit.jobRole}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {visit.description}
                </p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                   <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(visit.visitDate)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{visit.visitTime}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{visit.package}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{visit.venue}</span>
                   </div>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-md text-xs space-y-1">
                   <p className="font-semibold">Eligibility:</p>
                   <p>Dept: {visit.eligibility.department.join(", ")}</p>
                   <p>Min CGPA: {visit.eligibility.minCGPA}</p>
                </div>
              </CardContent>
              <CardFooter>
                 <div className="w-full flex gap-2">
                   <Link to={`/company/${visit._id}`} className="w-full">
                     <Button className="w-full" variant="outline">View Details</Button>
                   </Link>
                   {isAdmin && (
                     <Link to={`/admin/placements/${visit._id}/edit`}>
                       <Button variant="outline">Edit</Button>
                     </Link>
                   )}
                 </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))) }
      </div>
    </div>
  );
}
