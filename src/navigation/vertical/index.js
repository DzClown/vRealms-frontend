import { useUserRoles } from '@/composables/userRoles';
import superadmin from './apps';

export default () => {
  const { isSuperAdmin } = useUserRoles();

  if (isSuperAdmin) {
    return [...superadmin];
  }
  return [];
};
