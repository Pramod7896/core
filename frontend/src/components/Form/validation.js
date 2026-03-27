export const validators = {
  required: (value) => (value ? "" : "This field is required"),

  email: (value) => (/\S+@\S+\.\S+/.test(value) ? "" : "Invalid email address"),

  minLength: (length) => (value) =>
    value.length >= length ? "" : `Minimum ${length} characters required`,

  maxLength: (length) => (value) =>
    value.length <= length ? "" : `Maximum ${length} characters allowed`,
};
