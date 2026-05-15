import { RoleGuard } from "@/components/auth/RoleGuard";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["INSTRUCTOR", "ADMIN"]} redirectTo="/dashboard">
      {children}
    </RoleGuard>
  );
}
