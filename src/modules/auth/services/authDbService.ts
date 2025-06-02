import { randomBytes } from 'crypto';
import { eq, and, gt, lt } from 'drizzle-orm';
import { db } from '@/db/index';
import { users, userSessions } from '@/db/schema/auth';
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
}

// 导出单例实例
export const authDbService = new AuthDbService(); 