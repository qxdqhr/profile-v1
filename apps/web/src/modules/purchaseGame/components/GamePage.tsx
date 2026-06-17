'use client';

/**
 * 游戏主页面组件
 */

import React, { useState, useEffect } from 'react';
import { GamePageProps } from '../types';
import { GameStatus } from '../types';
import { usePurchaseGame } from '../hooks/usePurchaseGame';
import { CountdownBar } from './CountdownBar';
import { CharacterDisplay } from './CharacterDisplay';
import { GameControls } from './GameControls';
import { SettlementModal } from './SettlementModal';
import { HelpModal } from './HelpModal';
import { configService } from '../services/configService';

export const GamePage: React.FC<GamePageProps> = ({ userId }) => {
  const {
    gameState,
    isLoading,
    error,
    initGame,
    purchaseProduct,
    skipProduct,
    settleGame,
    resetGame,
  } = usePurchaseGame(userId);

  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementData, setSettlementData] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // 处理购买动画
  const handlePurchase = async () => {
    setIsAnimating(true);
    await purchaseProduct();
    setTimeout(() => setIsAnimating(false), 500);
  };

  // 处理游戏结束
  useEffect(() => {
    if (gameState.status === GameStatus.FINISHED) {
      const handleGameEnd = async () => {
        try {
          await settleGame();
          // 游戏结算后显示弹窗
          setShowSettlement(true);
        } catch (error) {
          console.error('Game settlement failed:', error);
        }
      };
      handleGameEnd();
    }
  }, [gameState.status, settleGame]);

  // 处理结算弹窗关闭
  const handleSettlementClose = () => {
    setShowSettlement(false);
    setSettlementData(null);
    resetGame();
  };

  const config = configService.getGameConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 游戏标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">购买挑战</h1>
          <p className="text-gray-600">在倒计时内做出明智的购买决策！</p>
          {/* 帮助按钮 */}
          <button
            onClick={() => setShowHelp(true)}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center mx-auto"
          >
            <span className="mr-2 text-lg">❓</span>
            游戏规则
          </button>
        </div>

        {/* 倒计时进度条 */}
        <CountdownBar
          timeRemaining={gameState.timeRemaining}
          totalTime={config.countdownTime}
          isActive={gameState.status === GameStatus.PLAYING}
        />

        {/* 游戏状态显示 */}
        <div className="flex justify-center items-center gap-8 mb-8">
          {/* 生命值 */}
          <div className="flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-full">
            <span className="text-2xl">❤️</span>
            <span className="font-bold text-red-800">
              {gameState.currentLife} / {config.initialLife}
            </span>
          </div>

          {/* 源石锭 */}
          <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
            <span className="text-2xl">💎</span>
            <span className="font-bold text-yellow-800">
              {gameState.currentMoney} / {config.initialMoney}
            </span>
          </div>

          {/* 总积分 */}
          <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
            <span className="text-2xl">🏆</span>
            <span className="font-bold text-blue-800">
              {gameState.totalScore} 分
            </span>
          </div>
        </div>

        {/* 游戏内容区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {gameState.status === GameStatus.IDLE ? (
            /* 游戏开始界面 */
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🎮</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">准备开始游戏</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                在30秒内尽可能多地购买商品，每次购买都会影响你的生命值或源石锭。
                生命值为0时游戏结束，看看你能获得多少积分！
              </p>
              <button
                onClick={initGame}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '准备中...' : '开始游戏'}
              </button>
            </div>
          ) : gameState.status === GameStatus.PLAYING ? (
            /* 游戏进行中 */
            <div className="space-y-8">
              {/* 人物立绘 */}
              <CharacterDisplay
                product={gameState.currentProduct}
                isAnimating={isAnimating}
              />

              {/* 操作按钮 */}
              <GameControls
                onPurchase={handlePurchase}
                onSkip={skipProduct}
                disabled={isLoading}
                currentProduct={gameState.currentProduct}
                currentLife={gameState.currentLife}
              />
            </div>
          ) : gameState.status === GameStatus.FINISHED ? (
            /* 游戏结束界面 */
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">游戏结束</h2>
              <p className="text-gray-600 mb-8">
                你的生命值已耗尽，游戏结束！
              </p>
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                重新开始
              </button>
            </div>
          ) : null}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}


      </div>

      {/* 结算弹窗 */}
      {settlementData && (
        <SettlementModal
          isOpen={showSettlement}
          onClose={handleSettlementClose}
          finalScore={settlementData.finalScore}
          totalPurchases={settlementData.totalPurchases}
          gameDuration={settlementData.gameDuration}
        />
      )}

      {/* 帮助弹窗 */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}; 