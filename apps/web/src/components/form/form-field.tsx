import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "select"
  | "textarea";

export interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  type?: FormFieldType;
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
  className?: string;
  control?: Control<T>;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  register,
  errors,
  control,
  type = "text",
  placeholder,
  options,
  required,
  className,
}: FormFieldProps<T>) {
  const error = errors[name] as { message?: string } | undefined;
  const hasError = Boolean(error);
  const errorId = `${String(name)}-error`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>

      {type === "select" ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
              disabled={field.disabled}
              name={field.name}
            >
              <SelectTrigger
                id={name}
                hasError={hasError}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
              >
                <SelectValue placeholder={placeholder ?? "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      ) : type === "textarea" ? (
        <textarea
          id={name}
          placeholder={placeholder}
          rows={6}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...register(name)}
          className={cn(
            "flex w-full rounded-lg border bg-background px-3 py-2 text-sm",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            hasError
              ? "border-destructive focus:ring-destructive"
              : "border-input",
          )}
        />
      ) : (
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          hasError={hasError}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...register(name, type === "number" ? { valueAsNumber: true } : {})}
        />
      )}

      {error?.message && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
