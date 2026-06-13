export const validationMessages = {
  required: "Este campo es obligatorio",
  firstName: {
    min: "El nombre debe tener al menos 2 caracteres",
    max: "El nombre no puede superar 50 caracteres",
    format: "Solo letras, espacios y acentos",
  },
  lastName: {
    min: "El apellido debe tener al menos 2 caracteres",
    max: "El apellido no puede superar 50 caracteres",
    format: "Solo letras, espacios y acentos",
  },
  email: {
    format: "Ingresá un email válido",
  },
  password: {
    min: "La contraseña debe tener al menos 8 caracteres",
    max: "La contraseña no puede superar 100 caracteres",
  },
  acceptTerms: "Debés aceptar los términos y condiciones",
  acceptPrivacy: "Debés aceptar la política de privacidad",
  verificationCode: {
    format: "El código debe tener exactamente 6 dígitos",
    invalid: "Código incorrecto. Probá con 123456",
  },
  dni: {
    format: "El DNI debe tener entre 7 y 8 dígitos numéricos",
  },
  birthDate: {
    invalid: "Ingresá una fecha válida",
    underage: "Debés ser mayor de 18 años",
  },
  nationality: {
    min: "La nacionalidad debe tener al menos 2 caracteres",
  },
  cuitCuil: {
    format: "El CUIT/CUIL debe tener exactamente 11 dígitos",
  },
  address: {
    min: "La dirección debe tener al menos 5 caracteres",
    max: "La dirección no puede superar 255 caracteres",
  },
  location: {
    min: "La ubicación debe tener al menos 2 caracteres",
    max: "La ubicación no puede superar 255 caracteres",
  },
  recoveryEmail: {
    format: "Ingresá un email de recuperación válido",
  },
  recoveryPhone: {
    format: "El teléfono debe tener al menos 10 dígitos numéricos",
  },
  pin: {
    format: "El PIN debe tener exactamente 4 dígitos numéricos",
  },
  image: {
    required: "Debés seleccionar un archivo",
    type: "Solo se permiten imágenes (JPG, PNG, WEBP)",
    size: "El archivo no puede superar 10 MB",
  },
  profilePhoto: {
    type: "Formato no permitido. Usá JPG, JPEG, PNG o WEBP",
    size: "La imagen no puede superar 10 MB",
  },
  bio: {
    max: "La bio no puede superar 300 caracteres",
  },
  education: {
    institution: "Ingresá la institución",
    degree: "Ingresá el título",
    year: "Ingresá un año válido (1900–actual)",
    partial: "Completá todos los campos de estudios",
  },
  certification: {
    name: "Ingresá el nombre de la certificación",
    issuer: "Ingresá el emisor",
    year: "Ingresá un año válido (1900–actual)",
    partial: "Completá todos los campos de certificación",
  },
  experience: {
    position: "Ingresá el cargo",
    company: "Ingresá la empresa",
    years: "Ingresá años de experiencia entre 0 y 60",
    partial: "Completá todos los campos de experiencia",
  },
  security: {
    valid: "Configuración de seguridad válida",
  },
} as const;
