/**
 * Auth 相关 UI（LoginModal / AuthGuard 等）经 sa2kit 组装，视觉依赖 sa2kit-ui。
 * 在 @profile/auth 入口一次性引入门面样式，避免宿主在 root layout 全局注入。
 * @see .cursor/rules/profile-v1-sa2kit-ui.mdc
 * @see .cursor/rules/profile-v1-sa2kit-ui.mdc
 */
import 'sa2kit/common/ui/style';
