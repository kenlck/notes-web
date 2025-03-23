import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function FormInput({
  label,
  ...props
}: React.ComponentProps<"input"> & {
  label?: string;
}) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input {...props} />
    </div>
  );
}
