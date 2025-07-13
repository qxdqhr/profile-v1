import { randomBytes } from 'crypto';
import { eq, and, gt, lt } from 'drizzle-orm';
import { db } from '@/db/index';
import { users, userSessions, verificationCodes } from '@/modules/auth/db/schema';
import bcrypt from 'bcryptjs';
import type { User, UserSession, SessionValidation, AuthService } from '../types';

/**
 * 认证数据库服务类
 * 处理用户认证、会话管理等数据库操作
 */
class AuthDbService implements AuthService {
  /**
   * 验证用户密码
   */
  async verifyPassword(phone: string, password: string): Promise<User | null> {
    try {
      console.log('🔍 [authDbService] 查找用户:', phone);
      
      // 查找用户
      const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
      
      if (result.length === 0) {
        console.log('❌ [authDbService] 用户不存在');
        return null;
      }
      
      const user = result[0];
      console.log('✅ [authDbService] 找到用户:', { id: user.id, phone: user.phone, isActive: user.isActive });
      
      // 检查用户是否激活
      if (!user.isActive) {
        console.log('❌ [authDbService] 用户已被禁用');
        return null;
      }
      
      // 验证密码
      console.log('🔐 [authDbService] 验证密码...');
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        console.log('❌ [authDbService] 密码验证失败');
        return null;
      }
      
      console.log('✅ [authDbService] 密码验证成功');
      
      // 返回用户信息时移除密码字段
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('💥 [authDbService] 密码验证异常:', error);
      return null;
    }
  }

  /**
   * 创建新用户
   */
  async createUser(phone: string, password: string, name?: string): Promise<User> {
    try {
      // 检查用户是否已存在
      const existingUser = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
      if (existingUser.length > 0) {
        throw new Error('用户已存在');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 12);

      // 创建用户
      const result = await db.insert(users)
        .values({
          phone,
          password: hashedPassword,
          name: name || null,
          isActive: true,
          role: 'user',
        })
        .returning();

      const { password: _, ...userWithoutPassword } = result[0];
      return userWithoutPassword as User;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw new Error('创建用户失败');
    }
  }

  /**
   * 更新用户最后登录时间
   */
  async updateLastLogin(userId: number): Promise<void> {
    try {
      await db.update(users)
        .set({
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('更新最后登录时间失败:', error);
      throw new Error('更新最后登录时间失败');
    }
  }

  /**
   * 创建用户会话
   */
  async createSession(userId: number): Promise<UserSession> {
    try {
      // 生成会话令牌
      const sessionToken = randomBytes(32).toString('hex');
      
      // 设置会话30天后过期
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const result = await db.insert(userSessions)
        .values({
          userId,
          sessionToken,
          expiresAt,
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('创建会话失败:', error);
      throw new Error('创建会话失败');
    }
  }

  /**
   * 验证会话
   */
  async validateSession(sessionToken: string): Promise<SessionValidation> {
    try {
      const now = new Date();
      
      // 查找会话及关联用户
      const result = await db.select({
        session: userSessions,
        user: users,
      })
        .from(userSessions)
        .innerJoin(users, eq(userSessions.userId, users.id))
        .where(
          and(
            eq(userSessions.sessionToken, sessionToken),
            gt(userSessions.expiresAt, now),
            eq(users.isActive, true)
          )
        )
        .limit(1);

      if (result.length === 0) {
        return { valid: false };
      }

      // 返回用户信息时移除密码字段
      const { password: _, ...userWithoutPassword } = result[0].user;
      return {
        valid: true,
        user: userWithoutPassword as User,
      };
    } catch (error) {
      console.error('会话验证失败:', error);
      return { valid: false };
    }
  }

  /**
   * 删除会话
   */
  async deleteSession(sessionToken: string): Promise<void> {
    try {
      await db.delete(userSessions)
        .where(eq(userSessions.sessionToken, sessionToken));
    } catch (error) {
      console.error('删除会话失败:', error);
      throw new Error('删除会话失败');
    }
  }

  /**
   * 删除用户的所有会话
   */
  async deleteUserSessions(userId: number): Promise<void> {
    try {
      await db.delete(userSessions)
        .where(eq(userSessions.userId, userId));
    } catch (error) {
      console.error('删除用户会话失败:', error);
      throw new Error('删除用户会话失败');
    }
  }

  /**
   * 清理过期的会话
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const now = new Date();
      await db.delete(userSessions)
        .where(lt(userSessions.expiresAt, now));
    } catch (error) {
      console.error('清理过期会话失败:', error);
    }
  }

  /**
   * 根据ID获取用户信息
   */
  async getUserById(userId: number): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (result.length === 0) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = result[0];
      return userWithoutPassword as User;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId: number, updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User | null> {
    try {
      const result = await db.update(users)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (result.length === 0) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = result[0];
      return userWithoutPassword as User;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw new Error('更新用户信息失败');
    }
  }

  /**
   * 根据手机号获取用户
   */
  async getUserByPhone(phone: string): Promise<User | null> {
    console.log('🔍 [AuthDbService] 根据手机号查询用户:', phone);
    try {
      const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
      console.log('✅ [AuthDbService] 用户查询结果:', result.length > 0 ? '找到用户' : '未找到用户');
      
      if (result.length === 0) {
        return null;
      }

      // 返回用户信息时移除密码字段
      const { password: _, ...userWithoutPassword } = result[0];
      return userWithoutPassword as User;
    } catch (error) {
      console.error('❌ [AuthDbService] 查询用户失败:', error);
      throw error;
    }
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(phone: string): Promise<string> {
    console.log('📱 [AuthDbService] 开始发送验证码:', phone);
    try {
      // 清理过期的验证码
      await this.cleanupExpiredVerificationCodes();
      
      // 检查是否存在未过期的验证码（防止频繁发送）
      const existingCode = await db.select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.phone, phone),
            eq(verificationCodes.used, false),
            gt(verificationCodes.expiresAt, new Date())
          )
        )
        .limit(1);

      if (existingCode.length > 0) {
        // 检查是否在60秒内
        const timeDiff = Date.now() - existingCode[0].createdAt.getTime();
        if (timeDiff < 60 * 1000) { // 60秒内
          throw new Error('验证码发送过于频繁，请稍后再试');
        }
      }
      
      // 生成6位数字验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 保存验证码到数据库
      await db.insert(verificationCodes)
        .values({
          phone,
          code,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10分钟有效期
        })
        .returning();
      
      // TODO: 实际项目中应该调用短信服务发送验证码
      // 这里为了演示，直接返回验证码
      console.log('✅ [AuthDbService] 验证码生成成功:', code);
      return code;
    } catch (error) {
      console.error('❌ [AuthDbService] 发送验证码失败:', error);
      throw error;
    }
  }

  /**
   * 验证验证码
   */
  async verifyCode(phone: string, code: string): Promise<boolean> {
    console.log('🔍 [AuthDbService] 验证验证码:', { phone, code });
    try {
      const result = await db.select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.phone, phone),
            eq(verificationCodes.code, code),
            eq(verificationCodes.used, false),
            gt(verificationCodes.expiresAt, new Date())
          )
        )
        .limit(1);

      if (result.length === 0) {
        console.log('❌ [AuthDbService] 验证码无效或已过期');
        return false;
      }

      // 标记验证码为已使用
      await db.update(verificationCodes)
        .set({ used: true })
        .where(eq(verificationCodes.id, result[0].id));

      console.log('✅ [AuthDbService] 验证码验证成功');
      return true;
    } catch (error) {
      console.error('❌ [AuthDbService] 验证码验证失败:', error);
      throw error;
    }
  }

  /**
   * 重置密码
   */
  async resetPassword(phone: string, newPassword: string): Promise<void> {
    console.log('🔑 [AuthDbService] 开始重置密码:', phone);
    try {
      // 对密码进行加密（使用统一的盐值轮数12）
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // 更新用户密码
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.phone, phone));
      
      console.log('✅ [AuthDbService] 密码重置成功');
    } catch (error) {
      console.error('❌ [AuthDbService] 密码重置失败:', error);
      throw error;
    }
  }

  /**
   * 清理过期的验证码
   */
  async cleanupExpiredVerificationCodes(): Promise<void> {
    console.log('🧹 [AuthDbService] 清理过期验证码');
    try {
      const now = new Date();
      const result = await db.delete(verificationCodes)
        .where(lt(verificationCodes.expiresAt, now))
        .returning();
      
      console.log(`✅ [AuthDbService] 清理了 ${result.length} 个过期验证码`);
    } catch (error) {
      console.error('❌ [AuthDbService] 清理过期验证码失败:', error);
    }
  }
}

// 导出单例实例
export const authDbService = new AuthDbService(); 