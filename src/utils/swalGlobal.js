import Swal from "sweetalert2";

// Tambahkan custom class untuk meningkatkan z-index
const swalWithCustomStyle = Swal.mixin({
  customClass: {
    popup: "custom-swal-popup",
    container: 'swal-overlay',
  },
  backdrop: true, // Aktifkan overlay
});

// Success Alert
export const showSuccessAlert = (title, text = "") => {
  return swalWithCustomStyle.fire({
    icon: "success",
    title,
    text,
    timer: 2000,
    showConfirmButton: false,
  });
};

// Error Alert
export const showErrorAlert = (title, text = "") => {
  return swalWithCustomStyle.fire({
    icon: "error",
    title,
    text,
    showConfirmButton: true,
  });
};

// Confirm Dialog (Yes/No)
export const showConfirmDialog = async (title, text = "") => {
  const result = await swalWithCustomStyle.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });
  return result.isConfirmed; // Returns true if "Yes" is clicked
};
