/**
 * Tarjeta de dato. Una sola para los tres paneles (alumno, instructor, admin):
 * antes cada uno tenía su copia con colores propios, y el mismo indicador se
 * veía distinto según la pantalla.
 *
 * ponytail: sin prop de color. El color por tarjeta es lo que rompía la
 * uniformidad; si algún día hace falta marcar un estado, se añade un `tone`
 * acotado a los tokens semánticos, no un className libre.
 */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-black tabular-nums text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
