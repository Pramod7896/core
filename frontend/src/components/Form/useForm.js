import { useState } from "react";

export const useForm = (initialValues = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);

  const [errors, setErrors] = useState({});

  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleValidate = (name, value, validations = []) => {
    for (let validate of validations) {
      const error = validate(value);

      if (error) {
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));

        return false;
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    return true;
  };

  const validateAll = (validationSchema = {}) => {
    let valid = true;

    let newErrors = {};

    for (let key in validationSchema) {
      for (let validate of validationSchema[key]) {
        const error = validate(values[key]);

        if (error) {
          newErrors[key] = error;

          valid = false;

          break;
        }
      }
    }

    setErrors(newErrors);

    return valid;
  };

  const handleSubmit = (e, validationSchema = {}) => {
    e.preventDefault();

    const valid = validateAll(validationSchema);

    if (valid && onSubmit) {
      onSubmit(values);
    }
  };

  const resetForm = () => {
    setValues(initialValues);

    setErrors({});

    setTouched({});
  };

  return {
    values,

    errors,

    touched,

    handleChange,

    handleBlur,

    handleValidate,

    handleSubmit,

    resetForm,

    setValues,
  };
};
