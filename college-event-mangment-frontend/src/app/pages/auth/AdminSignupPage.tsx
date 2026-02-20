import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

const adminSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organization: z.string().min(2, "Organization name required"),
  position: z.string().min(2, "Position required"),
});

type AdminSignupValues = z.infer<typeof adminSignupSchema>;

export function AdminSignupPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AdminSignupValues>({
    resolver: zodResolver(adminSignupSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organization: "",
      position: "",
    },
  });

  const onSubmit = async (data: AdminSignupValues) => {
    setIsLoading(true);

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'admin',
        organization: data.organization,
        position: data.position,
      });

      toast.success('Admin access granted.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-destructive/5 via-background to-background pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl border-t-4 border-t-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-destructive" />
                <CardTitle className="text-2xl">Admin Access</CardTitle>
              </div>
            </div>
            <CardDescription>
              Register for administrative control over campus events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} placeholder="Dr. Jane Doe" />
                {form.formState.errors.name && form.formState.touchedFields.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" {...form.register("email")} placeholder="admin@college.edu" />
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
                  <Label>Organization</Label>
                  <Input {...form.register("organization")} placeholder="University Placement Cell" />
                  {form.formState.errors.organization && form.formState.touchedFields.organization && (
                    <p className="text-xs text-destructive">{form.formState.errors.organization.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input {...form.register("position")} placeholder="Coordinator" />
                  {form.formState.errors.position && form.formState.touchedFields.position && (
                    <p className="text-xs text-destructive">{form.formState.errors.position.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Access...
                  </>
                ) : (
                  "Register as Admin"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
