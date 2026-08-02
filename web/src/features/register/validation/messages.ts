import {
  registerApiLimits,
  registerUiStricterLimits,
} from "@propie/registration-validation";

const api = registerApiLimits;
const ui = registerUiStricterLimits;

export const validationMessages = {
  required: "Este campo es obligatorio",
  firstName: {
    min: `El nombre debe tener al menos ${api.firstName.min} caracteres`,
    max: `El nombre no puede superar ${ui.firstNameMax} caracteres`,
    format: "Solo letras, espacios y acentos",
  },
  lastName: {
    min: `El apellido debe tener al menos ${api.lastName.min} caracteres`,
    max: `El apellido no puede superar ${ui.lastNameMax} caracteres`,
    format: "Solo letras, espacios y acentos",
  },
  email: {
    format: "Ingresá un email válido",
    max: `El email no puede superar ${api.email.max} caracteres`,
    alreadyExists: "Este email ya está registrado.",
  },
  submit: {
    generic: "No pudimos crear tu cuenta. Intentá de nuevo.",
    registrationDisabled: "El registro no está disponible en este momento.",
  },
  password: {
    min: `La contraseña debe tener al menos ${api.password.min} caracteres`,
    max: `La contraseña no puede superar ${api.password.max} caracteres`,
  },
  acceptTerms: "Debés aceptar los términos y condiciones",
  acceptPrivacy: "Debés aceptar la política de privacidad",
  verificationCode: {
    format: `El código debe tener exactamente ${ui.verificationCodeLength} dígitos`,
    invalid: "Código incorrecto. Revisá el código e intentá de nuevo.",
  },
  dni: {
    format: `El DNI debe tener entre ${api.dni.min} y ${ui.dniMax} dígitos numéricos`,
  },
  birthDate: {
    invalid: "Ingresá una fecha válida",
    underage: `Debés ser mayor de ${ui.minAge} años`,
  },
  nationality: {
    min: `La nacionalidad debe tener al menos ${api.nationality.min} caracteres`,
    max: `La nacionalidad no puede superar ${api.nationality.max} caracteres`,
  },
  cuitCuil: {
    format: `El CUIT/CUIL debe tener exactamente ${ui.cuitCuilLength} dígitos`,
  },
  address: {
    min: `La dirección debe tener al menos ${api.address.min} caracteres`,
    max: `La dirección no puede superar ${api.address.max} caracteres`,
  },
  location: {
    min: `La ubicación debe tener al menos ${api.location.min} caracteres`,
    max: `La ubicación no puede superar ${api.location.max} caracteres`,
  },
  phone: {
    format: `El teléfono debe tener al menos ${api.phone.min} dígitos numéricos`,
    max: `El teléfono no puede superar ${api.phone.max} dígitos`,
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
    max: `La bio no puede superar ${api.bio.max} caracteres`,
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
