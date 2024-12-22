import { useCookie } from "@/@core/composable/useCookie";
import { useLocalStorage } from "./useLocalStorage";

export const useUserRoles = () => {
  const userRole = useCookie('vrealms-dash-admin-userRole').value;
  const roles = Array.isArray(userRole) ? userRole : userRole ? [userRole] : [];
  const userData = useLocalStorage('vRealms-dash-userData').value;
  const userLevel = Array.isArray(userData?.roleLevel) ? userData.roleLevel : [];

  return {
    isSuperAdmin: roles.includes('ROLE_SUPER_ADMIN'),
    role: roles,
    level: userLevel,
  };
};
