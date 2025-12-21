import { userApi } from '@/api/platform/user-api';
import { createCrudHooks } from '@/hooks/factories';

// Create standard CRUD hooks
const { KEYS, useList, useDetail, useActions, useNavigation } = createCrudHooks({
  api: userApi,
  entityKey: 'users',
  singular: 'User',
  plural: 'Users',
  defaults: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    messages: {
      updateSuccess: "User updated successfully",
      deleteSuccess: "User deleted successfully",
    },
  },
});

// Export standard hooks
export {
  KEYS as USER_KEYS,
  useList as useUsers,
  useDetail as useUserDetail,
  useActions as useUserActions,
  useNavigation as useUserNavigation,
};
