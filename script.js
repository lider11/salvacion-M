const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const leadForm = document.querySelector("#lead-form");
const formStatus = document.querySelector("#form-status");
const submitButton = document.querySelector("#submit-button");
const description = document.querySelector("#descripcion");
const charCount = document.querySelector("#char-count");
const yearTarget = document.querySelector("#current-year");

const API_BASE_URL = "";

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (menuToggle && mainNav) {
  const menuLabel = menuToggle.querySelector(".menu-toggle-label");
  const menuIcon = menuToggle.querySelector(".menu-toggle-icon");
  const navLinks = Array.from(mainNav.querySelectorAll("a"));

  const setMenuState = (isOpen, returnFocus = false) => {
    mainNav.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
    );

    if (menuLabel) {
      menuLabel.textContent = isOpen
        ? "Cerrar menú de navegación"
        : "Abrir menú de navegación";
    }

    if (menuIcon) {
      menuIcon.textContent = isOpen ? "✕" : "☰";
    }

    document.body.classList.toggle("menu-open", isOpen);

    if (isOpen) {
      navLinks[0]?.focus();
    } else if (returnFocus) {
      menuToggle.focus();
    }
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    setMenuState(isOpen);
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenuState(false, true);
      return;
    }

    if (event.key === "Tab" && navLinks.length > 0) {
      const firstLink = navLinks[0];
      const lastLink = navLinks[navLinks.length - 1];

      if (event.shiftKey && document.activeElement === firstLink) {
        event.preventDefault();
        menuToggle.focus();
      } else if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        menuToggle.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760 && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuState(false);
    }
  });
}

if (description && charCount) {
  const updateCount = () => {
    charCount.textContent = `${description.value.length} / 3000`;
  };

  description.addEventListener("input", updateCount);
  updateCount();
}

const setFieldError = (name, message = "") => {
  const errorNode = document.querySelector(`[data-error-for="${name}"]`);
  const field = leadForm?.elements?.[name];

  if (errorNode) {
    errorNode.textContent = message;
  }

  if (field) {
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }
};

const clearErrors = () => {
  document.querySelectorAll(".field-error").forEach((node) => {
    node.textContent = "";
  });

  if (!leadForm) return;

  Array.from(leadForm.elements).forEach((field) => {
    if (field?.removeAttribute) {
      field.removeAttribute("aria-invalid");
    }
  });
};

const validateForm = (formData) => {
  const errors = {};

  const nombre = String(formData.get("nombre") || "").trim();
  const telefono = String(formData.get("telefono") || "").trim();
  const correo = String(formData.get("correo") || "").trim();
  const ciudad = String(formData.get("ciudad") || "").trim();
  const tipoSolicitud = String(formData.get("tipoSolicitud") || "").trim();
  const descripcion = String(formData.get("descripcion") || "").trim();
  const aceptaPrivacidad = formData.get("aceptaPrivacidad") === "on";

  if (nombre.length < 2) {
    errors.nombre = "Ingresa tu nombre completo.";
  }

  if (!/^[0-9+()\s-]{7,25}$/.test(telefono)) {
    errors.telefono = "Ingresa un teléfono válido.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errors.correo = "Ingresa un correo válido.";
  }

  if (ciudad.length < 2) {
    errors.ciudad = "Ingresa tu ciudad.";
  }

  if (!tipoSolicitud) {
    errors.tipoSolicitud = "Selecciona el tipo de solicitud.";
  }

  if (descripcion.length < 20) {
    errors.descripcion = "Describe tu situación con al menos 20 caracteres.";
  }

  if (!aceptaPrivacidad) {
    errors.aceptaPrivacidad = "Debes aceptar el tratamiento de datos para enviar la solicitud.";
  }

  return errors;
};

const setFormStatus = (message, type = "") => {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
};

const buildPayload = (formData) => ({
  nombre: String(formData.get("nombre") || "").trim(),
  telefono: String(formData.get("telefono") || "").trim(),
  correo: String(formData.get("correo") || "").trim(),
  ciudad: String(formData.get("ciudad") || "").trim(),
  eps: String(formData.get("eps") || "").trim(),
  tipoSolicitud: String(formData.get("tipoSolicitud") || "").trim(),
  descripcion: String(formData.get("descripcion") || "").trim(),
  preferenciaContacto: String(formData.get("preferenciaContacto") || "").trim(),
  aceptaPrivacidad: formData.get("aceptaPrivacidad") === "on"
});

const submitLead = async (payload) => {
  if (!API_BASE_URL) {
    return {
      ok: false,
      demo: true,
      message: "La página ya está lista, pero el envío al CRM aún no está conectado."
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.ok === false) {
    const error = new Error(data.message || "No fue posible enviar la solicitud.");
    error.data = data;
    throw error;
  }

  return data;
};

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    setFormStatus("");

    const formData = new FormData(leadForm);

    if (String(formData.get("website") || "").trim()) {
      setFormStatus("No fue posible procesar la solicitud.", "error");
      return;
    }

    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([name, message]) => {
        setFieldError(name, message);
      });

      const firstInvalid = leadForm.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      setFormStatus("Revisa los campos señalados.", "error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    setFormStatus("Procesando tu solicitud...");

    try {
      const payload = buildPayload(formData);
      const result = await submitLead(payload);

      if (result.demo) {
        setFormStatus(
          "El formulario está validado, pero la conexión con el CRM aún no ha sido configurada. Puedes contactarnos por WhatsApp o correo.",
          "error"
        );
        return;
      }

      const reference = result.id ? ` Referencia: ${result.id}.` : "";
      setFormStatus(`Solicitud recibida correctamente.${reference}`, "success");
      leadForm.reset();

      if (description && charCount) {
        charCount.textContent = "0 / 3000";
      }
    } catch (error) {
      if (error?.data?.fields) {
        Object.entries(error.data.fields).forEach(([name, message]) => {
          setFieldError(name, message);
        });
      }

      setFormStatus(
        error?.message || "No fue posible enviar la solicitud. Inténtalo nuevamente o contáctanos directamente.",
        "error"
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar solicitud";
    }
  });
}
