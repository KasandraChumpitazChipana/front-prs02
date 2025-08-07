
import { isRequired, maxLength } from './validations';


export const validateUserId = (userId) => {
    if (!isRequired(userId)) {
        return 'Debe seleccionar un usuario.';
    }
    return '';
};


export const validateSedeId = (sedeId) => {
    if (!isRequired(sedeId)) {
        return 'Debe seleccionar una sede.';
    }
    return '';
};


export const validateAssignedAt = (date) => {
    if (!isRequired(date)) {
        return 'La fecha de asignación es obligatoria.';
    }
    return '';
};


export const validateActiveUntil = (activeUntil, assignedAt) => {
    if (activeUntil && assignedAt) {
        if (new Date(activeUntil) < new Date(assignedAt)) {
            return 'La fecha "Activo Hasta" no puede ser anterior a la fecha de asignación.';
        }
    }
    return '';
};


export const validateOptionalTextField = (text, fieldName, max = 255) => {
    if (text && !maxLength(text, max)) {
        return `${fieldName} no debe exceder los ${max} caracteres.`;
    }
    return '';
};

    