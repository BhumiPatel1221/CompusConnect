import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyVisitService } from "../../../services/companyVisitService";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const createCompanyVisitSchema = z.object({
  companyName: z.string().min(2).max(100),
  jobRole: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  visitDate: z.string(),
  visitTime: z.string().min(1),
  venue: z.string().min(2),
  package: z.string().optional(),
  applicationDeadline: z.string().optional(),
  eligibility: z.object({
    department: z.array(z.string()).min(1, "Select at least one department"),
    year: z.array(z.string()).min(1, "Select at least one year"),
    minCGPA: z.coerce.number().min(0).max(10).optional(),
  }),
  contactPerson: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

type CreateCompanyVisitValues = z.infer<typeof createCompanyVisitSchema>;

const DEPARTMENTS = ["All", "CSE", "ECE", "ME", "CE", "EE", "IT", "Other"];
const YEARS = ["1", "2", "3", "4"];

export function CreateCompanyVisitPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<CreateCompanyVisitValues>({
    resolver: zodResolver(createCompanyVisitSchema) as any,
    mode: "onBlur",
    defaultValues: {
      companyName: "",
      jobRole: "",
      description: "",
      venue: "",
      eligibility: {
        department: [],
        year: [],
        minCGPA: 0,
      },
    },
  });

  const logoAlt = useMemo(() => form.watch("companyName") || "Company", [form.watch("companyName")]);

  const onSubmit = async (data: CreateCompanyVisitValues) => {
    setIsLoading(true);
    try {
      await companyVisitService.createCompanyVisitWithLogo(
        {
        companyName: data.companyName,
        jobRole: data.jobRole,
        description: data.description,
        eligibility: {
          department: data.eligibility.department,
          year: data.eligibility.year.map((y) => Number(y)),
          minCGPA: data.eligibility.minCGPA ?? 0,
        },
        visitDate: data.visitDate,
        visitTime: data.visitTime,
        venue: data.venue,
        package: data.package ?? "",
        applicationDeadline: (data.applicationDeadline as any) || "",
        contactPerson: data.contactPerson
          ? {
              name: data.contactPerson.name ?? "",
              email: data.contactPerson.email ?? "",
              phone: data.contactPerson.phone ?? "",
            }
          : {
              name: "",
              email: "",
              phone: "",
            },
        },
        logoFile
      );

      toast.success("Company visit created successfully");
      navigate("/admin/placements");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create company visit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Add Company Visit</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visit Details</CardTitle>
          <CardDescription>Fill in the details for the new company visit.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" {...form.register("companyName")} placeholder="e.g. Google India" />
              {form.formState.errors.companyName && (
                <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobRole">Job Role</Label>
              <Input id="jobRole" {...form.register("jobRole")} placeholder="e.g. Software Engineer" />
              {form.formState.errors.jobRole && (
                <p className="text-xs text-destructive">{form.formState.errors.jobRole.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Company Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setLogoFile(file);
                  setLogoPreview(file ? URL.createObjectURL(file) : null);
                }}
              />
              {logoPreview && (
                <div className="overflow-hidden rounded-lg border bg-muted/10">
                  <img src={logoPreview} alt={logoAlt} className="h-40 w-full object-cover" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Upload a logo image for the company visit.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Company visit details..."
                className="min-h-[100px]"
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitDate">Visit Date</Label>
                <Input id="visitDate" type="date" {...form.register("visitDate")} />
                {form.formState.errors.visitDate && (
                  <p className="text-xs text-destructive">{form.formState.errors.visitDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitTime">Visit Time</Label>
                <Input id="visitTime" type="time" {...form.register("visitTime")} />
                {form.formState.errors.visitTime && (
                  <p className="text-xs text-destructive">{form.formState.errors.visitTime.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Location</Label>
                <Input id="venue" {...form.register("venue")} placeholder="Placement Cell" />
                {form.formState.errors.venue && (
                  <p className="text-xs text-destructive">{form.formState.errors.venue.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="package">Package (Optional)</Label>
                <Input id="package" {...form.register("package")} placeholder="18-25 LPA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Registration Deadline (Optional)</Label>
                <Input id="applicationDeadline" type="date" {...form.register("applicationDeadline")} />
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
              <h3 className="font-medium text-sm">Eligibility Criteria</h3>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Departments</Label>
                <div className="flex flex-wrap gap-4">
                  {DEPARTMENTS.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${dept}`}
                        onCheckedChange={(checked: boolean | "indeterminate") => {
                          const current = form.getValues("eligibility.department");
                          if (checked) form.setValue("eligibility.department", [...current, dept]);
                          else form.setValue("eligibility.department", current.filter((d) => d !== dept));
                        }}
                      />
                      <label htmlFor={`dept-${dept}`} className="text-sm">
                        {dept}
                      </label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.eligibility?.department && (
                  <p className="text-xs text-destructive">{form.formState.errors.eligibility.department.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Years</Label>
                <div className="flex flex-wrap gap-4">
                  {YEARS.map((year) => (
                    <div key={year} className="flex items-center space-x-2">
                      <Checkbox
                        id={`year-${year}`}
                        onCheckedChange={(checked: boolean | "indeterminate") => {
                          const current = form.getValues("eligibility.year");
                          if (checked) form.setValue("eligibility.year", [...current, year]);
                          else form.setValue("eligibility.year", current.filter((y) => y !== year));
                        }}
                      />
                      <label htmlFor={`year-${year}`} className="text-sm">
                        Year {year}
                      </label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.eligibility?.year && (
                  <p className="text-xs text-destructive">{form.formState.errors.eligibility.year.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minCGPA">Min CGPA</Label>
                <Input id="minCGPA" type="number" step="0.1" {...form.register("eligibility.minCGPA")} />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Visit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
