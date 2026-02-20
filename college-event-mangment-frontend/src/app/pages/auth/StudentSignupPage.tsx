import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

const studentSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.enum(["CSE", "ECE", "ME", "CE", "EE", "IT", "Other"]),
  year: z.enum(["1", "2", "3", "4"]),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
});

type StudentSignupValues = z.infer<typeof studentSignupSchema>;

const INTERESTS = [
  { id: "technical", label: "Technical" },
  { id: "cultural", label: "Cultural" },
  { id: "sports", label: "Sports" },
  { id: "placement", label: "Placement" },
];

export function StudentSignupPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StudentSignupValues>({
    resolver: zodResolver(studentSignupSchema),
    mode: "onBlur", // Only validate after user leaves the field
    defaultValues: {
      name: "",
      email: "",
      password: "",
      department: undefined,
      year: undefined,
      interests: [],
    },
  });

  const onSubmit = async (data: StudentSignupValues) => {
    setIsLoading(true);

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'student',
        department: data.department,
        year: data.year,
        interests: data.interests,
      });

      toast.success('Account created successfully!');
      navigate('/student/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <CardTitle className="text-2xl">Student Registration</CardTitle>
            </div>
            <CardDescription>
              Join the campus network to access events and placements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} placeholder="John Doe" />
                {form.formState.errors.name && form.formState.touchedFields.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">College Email</Label>
                <Input id="email" {...form.register("email")} placeholder="john@college.edu" />
                {form.formState.errors.email && form.formState.touchedFields.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && form.formState.touchedFields.password && (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select onValueChange={(val) => form.setValue("department", val as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Dept" />
                    </SelectTrigger>
                    <SelectContent>
                      {["CSE", "ECE", "ME", "CE", "EE", "IT", "Other"].map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.department && (
                    <p className="text-xs text-destructive">{form.formState.errors.department.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select onValueChange={(val) => form.setValue("year", val as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4"].map((year) => (
                        <SelectItem key={year} value={year}>Year {year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.year && (
                    <p className="text-xs text-destructive">{form.formState.errors.year.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS.map((interest) => (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest.id}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("interests");
                          if (checked) {
                            form.setValue("interests", [...current, interest.id]);
                          } else {
                            form.setValue("interests", current.filter((i) => i !== interest.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={interest.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {interest.label}
                      </label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.interests && (
                  <p className="text-xs text-destructive">{form.formState.errors.interests.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Register as Student"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
