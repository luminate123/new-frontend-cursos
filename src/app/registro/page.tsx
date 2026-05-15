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
import { useRegister } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";

const registerSchema = z.object({
  firstName: z.string().min(2, "Minimo 2 caracteres"),
  lastName: z.string().min(2, "Minimo 2 caracteres"),
  email: z.string().email("Email invalido"),
  password: z
    .string()
    .min(8, "Minimo 8 caracteres")
    .regex(/(?=.*[a-z])/, "Debe tener al menos una minuscula")
    .regex(/(?=.*[A-Z])/, "Debe tener al menos una mayuscula")
    .regex(/(?=.*\d)/, "Debe tener al menos un numero"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contrasenas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegistroPage() {
  const router = useRouter();
  const registerMutation = useRegister();
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
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    try {
      await registerMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success("Cuenta creada");
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(err?.message || "Error al registrarse");
    }
  };

  return (
    <AuthCard title="Crear cuenta" subtitle="Registrate en EduTech Pro">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {serverError}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" placeholder="Juan" {...register("firstName")} className="bg-[var(--background)] border-[var(--border)]" />
          {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" placeholder="Perez" {...register("lastName")} className="bg-[var(--background)] border-[var(--border)]" />
          {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
          <Input id="confirmPassword" type="password" placeholder="********" {...register("confirmPassword")} className="bg-[var(--background)] border-[var(--border)]" />
          {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
        </div>
        <SubmitButton isLoading={registerMutation.isPending}>Registrarse</SubmitButton>
        <p className="text-center text-sm text-slate-400">
          Ya tienes cuenta?{" "}
          <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Inicia sesion
          </a>
        </p>
      </form>
    </AuthCard>
  );
}