import { db } from '../index';
import { users, verificationCodes, userSessions } from '../schema/auth';
import { eq, and, gt, lt } from 'drizzle-orm';
import { randomBytes } from 'crypto';

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
      
      return result[0] || null;
    } catch (error) {
      console.error('查找用户失败:', error);
      throw new Error('查找用户失败');
    }
  }

  /**
   * 创建新用户
   */
  async createUser(phone: string, name?: string, email?: string): Promise<User> {
    try {
      const result = await db.insert(users)
        .values({
          phone,
          name,
          email,
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('创建用户失败:', error);
      throw new Error('创建用户失败');
    }
  }

  /**
   * 生成验证码
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 保存验证码到数据库
   */
  async saveVerificationCode(phone: string, code: string, type: string = 'login'): Promise<void> {
    try {
      // 设置验证码5分钟后过期
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      await db.insert(verificationCodes)
        .values({
          phone,
          code,
          type,
          expiresAt,
        });
    } catch (error) {
      console.error('保存验证码失败:', error);
      throw new Error('保存验证码失败');
    }
  }

  /**
   * 验证验证码
   */
  async verifyCode(phone: string, code: string, type: string = 'login'): Promise<boolean> {
    try {
      const now = new Date();
      
      // 查找有效的验证码
      const result = await db.select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.phone, phone),
            eq(verificationCodes.code, code),
            eq(verificationCodes.type, type),
            eq(verificationCodes.isUsed, false),
            gt(verificationCodes.expiresAt, now)
          )
        )
        .limit(1);

      if (result.length === 0) {
        return false;
      }

      // 标记验证码为已使用
      await db.update(verificationCodes)
        .set({ isUsed: true })
        .where(eq(verificationCodes.id, result[0].id));

      return true;
    } catch (error) {
      console.error('验证码验证失败:', error);
      return false;
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

      return {
        valid: true,
        user: result[0].user,
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
   * 清理过期的验证码
   */
  async cleanupExpiredCodes(): Promise<void> {
    try {
      const now = new Date();
      await db.delete(verificationCodes)
        .where(lt(verificationCodes.expiresAt, now));
    } catch (error) {
      console.error('清理过期验证码失败:', error);
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

// 导出服务实例
export const authDbService = new AuthDbService(); 