import Swal from 'sweetalert2';

export const alertSuccess = (mensaje) => {
  Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: mensaje,
    confirmButtonText: 'Ok'
  });
};

export const alertError = (mensaje) => {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: mensaje,
    confirmButtonText: 'Ok'
  });
};

export const alertWarning = (mensaje) => {
  Swal.fire({
    icon: 'warning',
    title: 'Advertencia',
    text: mensaje,
    confirmButtonText: 'Ok'
  });
};

export const alertInfo = (mensaje) => {
  Swal.fire({
    icon: 'info',
    title: 'Información',
    text: mensaje,
    confirmButtonText: 'Ok'
  });
};

export const alertConfirm = async (mensaje) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: mensaje,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar'
  });
  return result.isConfirmed;
};