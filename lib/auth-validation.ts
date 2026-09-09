export type AuthMode = "login" | "signup";

export const ROLE_OPTIONS = [
  "Backend Developer",
  "DevOps Engineer",
  "Frontend Developer",
  "Manager",
  "QA Engineer",
  "UI/UX",
] as const;

export type RoleOption = (typeof ROLE_OPTIONS)[number];

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export type LoginField = keyof LoginFormValues;
export type SignupField = keyof SignupFormValues;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Email is required";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Enter a valid email address";
  }
  return undefined;
}

export function validateLoginPassword(value: string): string | undefined {
  if (!value) {
    return "Password is required";
  }
  if (value.length < 8) {
    return "Password must be at least 8 characters";
  }
  return undefined;
}

export function validateSignupPassword(value: string): string | undefined {
  if (!value) {
    return "Password is required";
  }
  if (value !== value.trim()) {
    return "Password must not have leading or trailing spaces";
  }
  if (value.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[a-zA-Z]/.test(value)) {
    return "Password must contain at least one letter";
  }
  if (!/\d/.test(value)) {
    return "Password must contain at least one number";
  }
  return undefined;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (confirmPassword !== password) {
    return "Passwords do not match";
  }
  return undefined;
}

export function validateUsername(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Username is required";
  }
  if (trimmed.length < 2) {
    return "Username must be at least 2 characters";
  }
  if (trimmed.length > 30) {
    return "Username must be at most 30 characters";
  }
  return undefined;
}

export function validateRole(value: string): string | undefined {
  if (!value) {
    return "Please select a role";
  }
  if (!ROLE_OPTIONS.includes(value as RoleOption)) {
    return "Please select a valid role";
  }
  return undefined;
}

export function validateLoginForm(values: LoginFormValues): Partial<Record<LoginField, string>> {
  const errors: Partial<Record<LoginField, string>> = {};
  const emailError = validateEmail(values.email);
  const passwordError = validateLoginPassword(values.password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function validateSignupForm(values: SignupFormValues): Partial<Record<SignupField, string>> {
  const errors: Partial<Record<SignupField, string>> = {};
  const usernameError = validateUsername(values.username);
  const emailError = validateEmail(values.email);
  const passwordError = validateSignupPassword(values.password);
  const confirmError = validateConfirmPassword(values.password, values.confirmPassword);
  const roleError = validateRole(values.role);

  if (usernameError) errors.username = usernameError;
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (confirmError) errors.confirmPassword = confirmError;
  if (roleError) errors.role = roleError;

  return errors;
}

export function validateLoginField(
  field: LoginField,
  values: LoginFormValues,
): string | undefined {
  switch (field) {
    case "email":
      return validateEmail(values.email);
    case "password":
      return validateLoginPassword(values.password);
  }
}

export function validateSignupField(
  field: SignupField,
  values: SignupFormValues,
): string | undefined {
  switch (field) {
    case "username":
      return validateUsername(values.username);
    case "email":
      return validateEmail(values.email);
    case "password":
      return validateSignupPassword(values.password);
    case "confirmPassword":
      return validateConfirmPassword(values.password, values.confirmPassword);
    case "role":
      return validateRole(values.role);
  }
}

export const EMPTY_LOGIN_VALUES: LoginFormValues = { email: "", password: "" };
export const EMPTY_SIGNUP_VALUES: SignupFormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
};

export function isLoginFormValid(values: LoginFormValues): boolean {
  return Object.keys(validateLoginForm(values)).length === 0;
}

export function isSignupFormValid(values: SignupFormValues): boolean {
  return Object.keys(validateSignupForm(values)).length === 0;
}
