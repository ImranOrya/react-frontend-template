export type ValidationRule =
  | "required"
  | `requiredIf:${string}:${boolean}`
  | `max:${number}`
  | `min:${number}`
  | ((userData: any) => boolean);
export interface ValidateItem {
  name: string;
  rules: ValidationRule[];
}
