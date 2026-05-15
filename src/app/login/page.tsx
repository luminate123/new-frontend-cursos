"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "Minimo 8 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [serverError, setServerError] = useState("");
  const { isAuthenticated, isLoading } = useAuthStore();

  // Already logged in → go to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    try {
      await loginMutation.mutateAsync(data);
      toast.success("Sesion iniciada");
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(err?.message || "Error al iniciar sesion");
    }
  };

  return (
    <AuthCard title="Iniciar sesion" subtitle="Accede a tu cuenta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {serverError}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} className="bg-[var(--background)] border-[var(--border)]" />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contrasena</Label>
          <Input id="password" type="password" placeholder="********" {...register("password")} className="bg-[var(--background)] border-[var(--border)]" />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>
        <SubmitButton isLoading={loginMutation.isPending}>Iniciar sesion</SubmitButton>
        <p className="text-center text-sm text-slate-400">
          No tienes cuenta?{" "}
          <a href="/registro" className="text-blue-400 hover:text-blue-300 transition-colors">
            Registrate
          </a>
        </p>
      </form>
    </AuthCard>
  );
}