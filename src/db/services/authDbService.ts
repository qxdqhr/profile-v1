import { db } from '../index';
import { users, userSessions } from '../schema/auth';
import { eq, and, gt, lt } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  phone: string;
  name?: string | null;
  email?: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: number;
  userId: number;
  sessionToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionValidation {
  valid: boolean;
  user?: User;
}

class AuthDbService {
  /**
   * 根据手机号查找用户
   */
  async findUserByPhone(phone: string): Promise<User | null> {
    try {
      const result = await db.select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('查找用户失败:', error);
      throw new Error('查找用户失败');
    }
  }

  /**
   * 验证用户密码
   */
  async verifyPassword(phone: string, password: string): Promise<User | null> {
    try {
      const result = await db.select()
        .from(users)
        .where(and(
          eq(users.phone, phone),
          eq(users.isActive, true)
        ))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const user = result[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }

      // 返回用户信息时移除密码字段
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('密码验证失败:', error);
      return null;
    }
  }

  /**
   * 创建用户（用于注册新用户）
   */
  async createUser(phone: string, password: string, name?: string, email?: string): Promise<User> {
    try {
      // 密码哈希
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const result = await db.insert(users)
        .values({
          phone,
          password: hashedPassword,
          name,
          email,
        })
        .returning();
      
      // 返回用户信息时移除密码字段
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
          updatedAt: new Date()
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
}

export const authDbService = new AuthDbService(); 