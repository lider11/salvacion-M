(() => {
  "use strict";

  const SELECTORS = Object.freeze({
    menuToggle: ".menu-toggle",
    mainNav: ".main-nav",
    leadForm: "#lead-form",
    formStatus: "#form-status",
    submitButton: "#submit-button",
    description: "#descripcion",
    charCount: "#char-count",
    year: "#current-year",
    fieldError: ".field-error",
  });

  const CONFIG = Object.freeze({
    desktopBreakpoint: 760,
    descriptionMaxLength: 3000,
    apiBaseUrl: "",
    requestTimeoutMs: 15000,
  });

  const MESSAGES = Object.freeze({
    menuOpen: "Abrir menú de navegación",
    menuClose: "Cerrar menú de navegación",
    sending: "Enviando...",
    submit: "Enviar solicitud",
    processing: "Procesando tu solicitud...",
    reviewFields: "Revisa los campos señalados.",
    botError: "No fue posible procesar la solicitud.",
    crmUnavailable:
      "El formulario está validado, pero la conexión con el CRM aún no ha sido configurada. Puedes contactarnos por WhatsApp o correo.",
    genericError:
      "No fue posible enviar la solicitud. Inténtalo nuevamente o contáctanos directamente.",
  });

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const elements = {
    menuToggle: $(SELECTORS.menuToggle),
    mainNav: $(SELECTORS.mainNav),
    leadForm: $(SELECTORS.leadForm),
    formStatus: $(SELECTORS.formStatus),
    submitButton: $(SELECTORS.submitButton),
    description: $(SELECTORS.description),
    charCount: $(SELECTORS.charCount),
    year: $(SELECTORS.year),
  };

  const getString = (formData, name) =>
    String(formData.get(name) ?? "").trim();

  const setCurrentYear = () => {
    if (elements.year) {
      elements.year.textContent = String(new Date().getFullYear());
    }
  };

  const initNavigation = () => {
    const { menuToggle, mainNav } = elements;
    if (!menuToggle || !mainNav) return;

    const menuLabel = $(".menu-toggle-label", menuToggle);
    const menuIcon = $(".menu-toggle-icon", menuToggle);
    const navLinks = $$("a", mainNav);
    const desktopQuery = window.matchMedia(
      `(min-width: ${CONFIG.desktopBreakpoint + 1}px)`
    );

    const isMenuOpen = () =>
      menuToggle.getAttribute("aria-expanded") === "true";

    const setMenuState = ({ open, returnFocus = false, focusFirst = false }) => {
      mainNav.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));

      const label = open ? MESSAGES.menuClose : MESSAGES.menuOpen;
      menuToggle.setAttribute("aria-label", label);

      if (menuLabel) menuLabel.textContent = label;
      if (menuIcon) menuIcon.textContent = open ? "✕" : "☰";

      document.body.classList.toggle("menu-open", open);

      if (open && focusFirst) {
        navLinks[0]?.focus();
      } else if (!open && returnFocus) {
        menuToggle.focus();
      }
    };

    menuToggle.addEventListener("click", () => {
      const open = !isMenuOpen();
      setMenuState({ open, focusFirst: open });
    });

    mainNav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link || !mainNav.contains(link)) return;
      setMenuState({ open: false });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isMenuOpen()) {
        event.preventDefault();
        setMenuState({ open: false, returnFocus: true });
      }
    });

    const handleDesktopChange = (event) => {
      if (event.matches && isMenuOpen()) {
        setMenuState({ open: false });
      }
    };

    desktopQuery.addEventListener?.("change", handleDesktopChange);
  };

  const updateCharacterCounter = () => {
    const { description, charCount } = elements;
    if (!description || !charCount) return;

    const length = description.value.length;
    charCount.textContent = `${length} / ${CONFIG.descriptionMaxLength}`;
    charCount.setAttribute(
      "aria-label",
      `${length} de ${CONFIG.descriptionMaxLength} caracteres`
    );
  };

  const initCharacterCounter = () => {
    if (!elements.description) return;
    elements.description.addEventListener("input", updateCharacterCounter);
    updateCharacterCounter();
  };

  const getField = (name) =>
    elements.leadForm?.elements?.namedItem(name) ?? null;

  const getErrorNode = (name) =>
    document.querySelector(`[data-error-for="${CSS.escape(name)}"]`);

  const ensureErrorAssociation = (name, field, errorNode) => {
    if (!field || !errorNode) return;

    if (!errorNode.id) errorNode.id = `${name}-error`;

    const describedBy = new Set(
      (field.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter(Boolean)
    );
    describedBy.add(errorNode.id);
    field.setAttribute("aria-describedby", [...describedBy].join(" "));
  };

  const setFieldError = (name, message = "") => {
    const field = getField(name);
    const errorNode = getErrorNode(name);

    if (errorNode) {
      errorNode.textContent = message;
      errorNode.hidden = !message;
    }

    if (field instanceof HTMLElement) {
      field.setAttribute("aria-invalid", message ? "true" : "false");
      ensureErrorAssociation(name, field, errorNode);
    }
  };

  const clearErrors = () => {
    if (!elements.leadForm) return;

    $$(SELECTORS.fieldError, elements.leadForm).forEach((node) => {
      node.textContent = "";
      node.hidden = true;
    });

    Array.from(elements.leadForm.elements).forEach((field) => {
      if (field instanceof HTMLElement) {
        field.setAttribute("aria-invalid", "false");
      }
    });
  };

  const initErrorAccessibility = () => {
    if (!elements.leadForm) return;

    $$(SELECTORS.fieldError, elements.leadForm).forEach((errorNode) => {
      const name = errorNode.dataset.errorFor;
      if (!name) return;

      const field = getField(name);
      if (!(field instanceof HTMLElement)) return;

      ensureErrorAssociation(name, field, errorNode);
      errorNode.hidden = !errorNode.textContent.trim();
    });
  };

  const validateForm = (formData) => {
    const errors = {};

    const nombre = getString(formData, "nombre");
    const telefono = getString(formData, "telefono");
    const correo = getString(formData, "correo");
    const ciudad = getString(formData, "ciudad");
    const tipoSolicitud = getString(formData, "tipoSolicitud");
    const descripcion = getString(formData, "descripcion");
    const aceptaPrivacidad = formData.get("aceptaPrivacidad") === "on";

    if (nombre.length < 2) errors.nombre = "Ingresa tu nombre completo.";
    if (!/^[0-9+()\s-]{7,25}$/.test(telefono)) {
      errors.telefono = "Ingresa un teléfono válido.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errors.correo = "Ingresa un correo válido.";
    }
    if (ciudad.length < 2) errors.ciudad = "Ingresa tu ciudad.";
    if (!tipoSolicitud) {
      errors.tipoSolicitud = "Selecciona el tipo de solicitud.";
    }
    if (descripcion.length < 20) {
      errors.descripcion = "Describe tu situación con al menos 20 caracteres.";
    }
    if (!aceptaPrivacidad) {
      errors.aceptaPrivacidad =
        "Debes aceptar el tratamiento de datos para enviar la solicitud.";
    }

    return errors;
  };

  const setFormStatus = (message = "", type = "") => {
    const { formStatus } = elements;
    if (!formStatus) return;

    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`.trim();
    formStatus.setAttribute("role", type === "error" ? "alert" : "status");
    formStatus.setAttribute(
      "aria-live",
      type === "error" ? "assertive" : "polite"
    );
    formStatus.setAttribute("aria-atomic", "true");
  };

  const buildPayload = (formData) => ({
    nombre: getString(formData, "nombre"),
    telefono: getString(formData, "telefono"),
    correo: getString(formData, "correo"),
    ciudad: getString(formData, "ciudad"),
    eps: getString(formData, "eps"),
    tipoSolicitud: getString(formData, "tipoSolicitud"),
    descripcion: getString(formData, "descripcion"),
    preferenciaContacto: getString(formData, "preferenciaContacto"),
    aceptaPrivacidad: formData.get("aceptaPrivacidad") === "on",
  });

  const submitLead = async (payload, signal) => {
    if (!CONFIG.apiBaseUrl) {
      return { ok: false, demo: true, message: MESSAGES.crmUnavailable };
    }

    const response = await fetch(`${CONFIG.apiBaseUrl}/api/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    const contentType = response.headers.get("content-type") || "";
    let data = {};

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = {};
      }
    }

    if (!response.ok || data.ok === false) {
      const error = new Error(data.message || MESSAGES.genericError);
      error.data = data;
      throw error;
    }

    return data;
  };

  const setSubmitting = (submitting) => {
    const { submitButton, leadForm } = elements;
    if (!submitButton) return;

    submitButton.disabled = submitting;
    submitButton.setAttribute("aria-disabled", String(submitting));
    submitButton.textContent = submitting ? MESSAGES.sending : MESSAGES.submit;
    leadForm?.setAttribute("aria-busy", String(submitting));
  };

  const focusFirstInvalidField = () => {
    elements.leadForm?.querySelector('[aria-invalid="true"]')?.focus();
  };

  const applyServerErrors = (fields) => {
    if (!fields || typeof fields !== "object") return;

    Object.entries(fields).forEach(([name, message]) => {
      if (typeof message === "string") setFieldError(name, message);
    });
  };

  const initForm = () => {
    const { leadForm, submitButton } = elements;
    if (!leadForm || !submitButton) return;

    leadForm.setAttribute("novalidate", "");
    initErrorAccessibility();

    leadForm.addEventListener("input", (event) => {
      const field = event.target;
      if (
        !(field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement)
      ) return;

      if (field.name && field.getAttribute("aria-invalid") === "true") {
        setFieldError(field.name, "");
      }
    });

    leadForm.addEventListener("change", (event) => {
      const field = event.target;
      if (
        !(field instanceof HTMLInputElement ||
          field instanceof HTMLSelectElement)
      ) return;

      if (field.name && field.getAttribute("aria-invalid") === "true") {
        setFieldError(field.name, "");
      }
    });

    leadForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors();
      setFormStatus("");

      const formData = new FormData(leadForm);

      if (getString(formData, "website")) {
        setFormStatus(MESSAGES.botError, "error");
        return;
      }

      const errors = validateForm(formData);

      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([name, message]) => {
          setFieldError(name, message);
        });

        setFormStatus(MESSAGES.reviewFields, "error");
        focusFirstInvalidField();
        return;
      }

      setSubmitting(true);
      setFormStatus(MESSAGES.processing);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        CONFIG.requestTimeoutMs
      );

      try {
        const payload = buildPayload(formData);
        const result = await submitLead(payload, controller.signal);

        if (result.demo) {
          setFormStatus(result.message || MESSAGES.crmUnavailable, "error");
          return;
        }

        const reference = result.id ? ` Referencia: ${result.id}.` : "";
        setFormStatus(
          `Solicitud recibida correctamente.${reference}`,
          "success"
        );

        leadForm.reset();
        clearErrors();
        updateCharacterCounter();
        elements.formStatus?.focus();
      } catch (error) {
        if (error?.name === "AbortError") {
          setFormStatus(
            "La solicitud tardó demasiado en responder. Inténtalo nuevamente.",
            "error"
          );
          return;
        }

        applyServerErrors(error?.data?.fields);
        setFormStatus(error?.message || MESSAGES.genericError, "error");

        if (error?.data?.fields) focusFirstInvalidField();
      } finally {
        window.clearTimeout(timeoutId);
        setSubmitting(false);
      }
    });
  };

  const init = () => {
    setCurrentYear();
    initNavigation();
    initCharacterCounter();
    initForm();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
