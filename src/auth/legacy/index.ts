/** sa2kit 路径兼容层：ShowMasterpiece 迁入后沿用 `@/auth/legacy` 引用 */
export {
  AuthGuard,
  AuthProvider,
  useAuth,
  UserMenu,
  LoginModal,
  RegisterModal,
  ForgotPasswordModal,
} from 'sa2kit/auth/legacy';

export type {
  CustomMenuItem,
  User,
  UserMenuProps,
  UseAuthReturn,
} from 'sa2kit/auth/legacy';
