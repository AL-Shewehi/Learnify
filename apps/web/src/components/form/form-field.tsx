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
  | "select";

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
              <SelectTrigger id={name} hasError={hasError}>
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
      ) : (
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          hasError={hasError}
          {...register(name)}
        />
      )}

      {error?.message && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}