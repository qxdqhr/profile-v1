import { isAdminRole } from '../host/auth/src/roles';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function main() {
  assert(isAdminRole('ADMIN'), 'ADMIN');
  assert(isAdminRole('admin'), 'admin case-insensitive');
  assert(isAdminRole('SUPER_ADMIN'), 'SUPER_ADMIN');
  assert(isAdminRole('super_admin'), 'super_admin case-insensitive');
  assert(!isAdminRole('USER'), 'USER is not admin');
  assert(!isAdminRole(''), 'empty is not admin');
  assert(!isAdminRole(null), 'null is not admin');
  assert(!isAdminRole(undefined), 'undefined is not admin');
  console.log('isAdminRole checks passed');
}

main();
