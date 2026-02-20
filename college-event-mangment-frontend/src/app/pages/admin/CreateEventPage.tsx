import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { eventService } from "../../../services/eventService";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const createEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum(["technical", "cultural", "sports", "placement"]),
  date: z.string(),
  time: z.string(),
  venue: z.string().min(2),
  eligibility: z.object({
    department: z.array(z.string()).min(1, "Select at least one department"),
    year: z.array(z.string()).min(1, "Select at least one year"),
  }),
  maxCapacity: z.coerce.number().min(1).optional(),
});

type CreateEventValues = z.infer<typeof createEventSchema>;

const DEPARTMENTS = ["CSE", "ECE", "ME", "CE", "EE", "IT", "Other"];
const YEARS = ["1", "2", "3", "4"];

export function CreateEventPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const form = useForm<CreateEventValues>({
    resolver: zodResolver(createEventSchema) as any,
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      venue: "",
      eligibility: {
        department: [],
        year: [],
      },
    },
  });

  const onSubmit = async (data: CreateEventValues) => {
    setIsLoading(true);
    try {
      await eventService.createEvent({
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date,
        time: data.time,
        venue: data.venue,
        eligibility: {
          department: data.eligibility.department,
          year: data.eligibility.year.map((y) => Number(y)),
        },
        maxCapacity: data.maxCapacity ?? 0,
      });

      toast.success("Event created successfully");
      navigate("/admin/events");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Create Event</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Fill in the details for the new campus event.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" {...form.register("title")} placeholder="e.g. Annual Tech Symposium" />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(val) => form.setValue("category", val as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["technical", "cultural", "sports", "placement"].map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Max Capacity (Optional)</Label>
                <Input id="maxCapacity" type="number" {...form.register("maxCapacity", { valueAsNumber: true })} placeholder="200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} placeholder="Event details..." className="min-h-[100px]" />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventImage">Event Image Upload</Label>
              <Input
                id="eventImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
                  setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
                }}
              />
              {imagePreviewUrl && (
                <div className="mt-3 overflow-hidden rounded-lg border bg-muted/10">
                  <img
                    src={imagePreviewUrl}
                    alt="Event preview"
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Preview only. The current backend endpoint does not store images yet.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...form.register("date")} />
                {form.formState.errors.date && (
                  <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" {...form.register("time")} />
                {form.formState.errors.time && (
                  <p className="text-xs text-destructive">{form.formState.errors.time.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" {...form.register("venue")} placeholder="Main Hall" />
                {form.formState.errors.venue && (
                  <p className="text-xs text-destructive">{form.formState.errors.venue.message}</p>
                )}
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
                          else form.setValue("eligibility.department", current.filter(d => d !== dept));
                        }}
                      />
                      <label htmlFor={`dept-${dept}`} className="text-sm">{dept}</label>
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
                          else form.setValue("eligibility.year", current.filter(y => y !== year));
                        }}
                      />
                      <label htmlFor={`year-${year}`} className="text-sm">Year {year}</label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.eligibility?.year && (
                  <p className="text-xs text-destructive">{form.formState.errors.eligibility.year.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
