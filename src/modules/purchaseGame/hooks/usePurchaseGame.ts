'use client';

/**
 * 购买游戏模块自定义Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameState, 
  GameStatus, 
  UsePurchaseGameReturn,
  SettleGameResponse
} from '../types';
import { gameService } from '../services/gameService';
import { configService } from '../services/configService';

/**
 * 购买游戏Hook
 */
export const usePurchaseGame = (userId?: string): UsePurchaseGameReturn => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.IDLE,
    currentLife: configService.getGameConfig().initialLife,
    currentMoney: configService.getGameConfig().initialMoney,
    currentProduct: null,
    timeRemaining: configService.getGameConfig().countdownTime,
    totalScore: 0,
    purchaseHistory: [],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [settlementData, setSettlementData] = useState<SettleGameResponse | null>(null);

  /**
   * 初始化游戏
   */
  const initGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await gameService.initGame(userId);
      
      if (response.success) {
        setGameState(response.gameState);
        startCountdown(response.gameState.timeRemaining);
      } else {
        setError(response.message || '游戏初始化失败');
      }
    } catch (err) {
      setError('游戏初始化失败');
      console.error('Failed to initialize game:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * 购买商品
   */
  const purchaseProduct = useCallback(async () => {
    if (gameState.status !== GameStatus.PLAYING || !gameState.currentProduct) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await gameService.purchaseProduct(userId, gameState.currentProduct.id);
      
      if (response.success) {
        setGameState(response.gameState);
        
        // 如果游戏结束，停止倒计时并结算
        if (response.gameState.status === GameStatus.FINISHED) {
          stopCountdown();
          const settlement = await gameService.settleGame(userId);
          setSettlementData(settlement);
        }
      } else {
        setError(response.error || '购买失败');
      }
    } catch (err) {
      setError('购买失败');
      console.error('Failed to purchase product:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameState.status, gameState.currentProduct, userId]);

  /**
   * 跳过商品
   */
  const skipProduct = useCallback(() => {
    if (gameState.status === GameStatus.PLAYING) {
      gameService.skipProduct();
      const currentState = gameService.getCurrentGameState();
      if (currentState) {
        setGameState(currentState);
      }
    }
  }, [gameState.status]);

  /**
   * 结算游戏
   */
  const settleGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await gameService.settleGame(userId);
      
      if (response.success) {
        setSettlementData(response);
        setGameState(prev => ({ ...prev, status: GameStatus.FINISHED }));
      } else {
        setError(response.message || '游戏结算失败');
      }
    } catch (err) {
      setError('游戏结算失败');
      console.error('Failed to settle game:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * 重置游戏
   */
  const resetGame = useCallback(() => {
    stopCountdown();
    gameService.resetGame();
    setGameState({
      status: GameStatus.IDLE,
      currentLife: configService.getGameConfig().initialLife,
      currentMoney: configService.getGameConfig().initialMoney,
      currentProduct: null,
      timeRemaining: configService.getGameConfig().countdownTime,
      totalScore: 0,
      purchaseHistory: [],
    });
    setError(null);
    setSettlementData(null);
  }, []);

  /**
   * 开始倒计时
   */
  const startCountdown = useCallback((initialTime: number) => {
    stopCountdown();
    
    let timeRemaining = initialTime;
    
    countdownRef.current = setInterval(() => {
      timeRemaining -= 1;
      
      if (timeRemaining <= 0) {
        stopCountdown();
        // 时间到，游戏结束
        settleGame();
      } else {
        gameService.updateCountdown(timeRemaining);
        setGameState(prev => ({ ...prev, timeRemaining }));
      }
    }, 1000);
  }, [settleGame]);

  /**
   * 停止倒计时
   */
  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  /**
   * 清理定时器
   */
  useEffect(() => {
    return () => {
      stopCountdown();
    };
  }, [stopCountdown]);

  /**
   * 同步游戏状态
   */
  useEffect(() => {
    const currentState = gameService.getCurrentGameState();
    if (currentState) {
      setGameState(currentState);
    }
  }, []);

  return {
    gameState,
    isLoading,
    error,
    initGame,
    purchaseProduct,
    skipProduct,
    settleGame,
    resetGame,
  };
}; 