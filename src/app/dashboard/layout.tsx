import { RoleGuard } from "@/components/auth/RoleGuard";
import { Navbar } from "@/components/layout/Navbar";

/**
 * La navbar vive aquí y no en cada página: montada página por página, las de
 * pagos, ingresos y certificados se quedaban sin barra superior y el usuario
 * perdía la navegación a mitad del panel.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["STUDENT", "INSTRUCTOR", "ADMIN"]} redirectTo="/login">
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        {children}
      </div>
    </RoleGuard>
  );
}
