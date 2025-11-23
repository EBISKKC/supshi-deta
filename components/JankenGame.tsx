'use client';

import { useState, useEffect } from 'react';
import { FaHandRock, FaHandPaper, FaHandScissors } from 'react-icons/fa';
import { IoStatsChart } from 'react-icons/io5';
import { MdHistory } from 'react-icons/md';
import styles from './JankenGame.module.css';
import type { Hand, Result, GameRecord, Statistics } from '@/types/janken';

const HAND_ICON: Record<Hand, React.ReactNode> = {
  rock: <FaHandRock size={48} />,
  paper: <FaHandPaper size={48} />,
  scissors: <FaHandScissors size={48} />,
};

const HAND_ICON_SMALL: Record<Hand, React.ReactNode> = {
  rock: <FaHandRock size={24} />,
  paper: <FaHandPaper size={24} />,
  scissors: <FaHandScissors size={24} />,
};

const HAND_LABEL: Record<Hand, string> = {
  rock: 'グー',
  paper: 'パー',
  scissors: 'チョキ',
};

const RESULT_LABEL: Record<Result, string> = {
  win: '勝ち！',
  lose: '負け',
  draw: 'あいこ',
};

export default function JankenGame() {
  const [playerHand, setPlayerHand] = useState<Hand | null>(null);
  const [computerHand, setComputerHand] = useState<Hand | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/sheets?range=sheet1!A1:E1000');

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      const values = data.values || [];

      // データが空の場合は何もしない
      if (values.length === 0) {
        setHistory([]);
        calculateStatistics([]);
        return;
      }

      // 最初の行がヘッダーかデータかを判定（タイムスタンプ形式かチェック）
      const firstRow = values[0];
      const isFirstRowHeader = firstRow[0] === 'タイムスタンプ' ||
                               firstRow[0] === 'timestamp' ||
                               !firstRow[0]?.includes('T'); // ISO形式のタイムスタンプでない

      const dataRows = isFirstRowHeader ? values.slice(1) : values;

      // 空行と不完全な行を除外してパース
      const records: GameRecord[] = dataRows
        .filter((row: string[]) => row[0] && row[1] && row[2] && row[3]) // 必須データがあるか確認
        .map((row: string[]) => ({
          timestamp: row[0] || '',
          playerHand: row[1] as Hand,
          computerHand: row[2] as Hand,
          result: row[3] as Result,
        }));

      setHistory(records.reverse()); // 新しい順に表示
      calculateStatistics(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (records: GameRecord[]) => {
    const totalGames = records.length;
    const wins = records.filter((r) => r.result === 'win').length;
    const losses = records.filter((r) => r.result === 'lose').length;
    const draws = records.filter((r) => r.result === 'draw').length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    setStatistics({
      totalGames,
      wins,
      losses,
      draws,
      winRate,
    });
  };

  const getComputerHand = (): Hand => {
    const hands: Hand[] = ['rock', 'paper', 'scissors'];
    return hands[Math.floor(Math.random() * hands.length)];
  };

  const determineResult = (player: Hand, computer: Hand): Result => {
    if (player === computer) return 'draw';

    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win';
    }

    return 'lose';
  };

  const saveGameRecord = async (record: GameRecord) => {
    try {
      const response = await fetch('/api/sheets/append', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: 'sheet1!A:E',
          values: [[
            record.timestamp,
            record.playerHand,
            record.computerHand,
            record.result,
            '', // 予備列
          ]],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save game record');
      }
    } catch (err) {
      console.error('Error saving game record:', err);
      setError('ゲーム結果の保存に失敗しました');
    }
  };

  const playGame = async (hand: Hand) => {
    const computer = getComputerHand();
    const gameResult = determineResult(hand, computer);

    setPlayerHand(hand);
    setComputerHand(computer);
    setResult(gameResult);

    const record: GameRecord = {
      timestamp: new Date().toISOString(),
      playerHand: hand,
      computerHand: computer,
      result: gameResult,
    };

    // Google Sheetsに保存
    await saveGameRecord(record);

    // ローカルの履歴を更新
    const newHistory = [record, ...history];
    setHistory(newHistory);
    calculateStatistics([...newHistory].reverse());
  };

  const resetGame = () => {
    setPlayerHand(null);
    setComputerHand(null);
    setResult(null);
  };

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Left Panel - History */}
      <div className={styles.historyPanel}>
        <h2 className={styles.historyTitle}>
          <MdHistory style={{ display: 'inline', marginRight: '0.5rem' }} />
          対戦履歴
        </h2>
        <div className={styles.historyList}>
          {history.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#1565c0', padding: '2rem', fontSize: '0.9rem' }}>
              まだ対戦履歴がありません
            </p>
          ) : (
            history.map((record, index) => (
              <div key={index} className={styles.historyItem}>
                <div className={styles.historyTime}>
                  {new Date(record.timestamp).toLocaleString('ja-JP', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className={styles.historyHands}>
                  {HAND_ICON_SMALL[record.playerHand]}
                  <span style={{ color: '#1565c0', fontSize: '0.9rem' }}>vs</span>
                  {HAND_ICON_SMALL[record.computerHand]}
                </div>
                <div className={`${styles.historyResult} ${styles[record.result]}`}>
                  {RESULT_LABEL[record.result]}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Center Panel - Game */}
      <div className={styles.gamePanel}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.gameArea}>
          <h1 className={styles.title}>じゃんけん</h1>

          <div className={styles.hands}>
            <button
              className={styles.handButton}
              onClick={() => playGame('rock')}
              aria-label="グー"
            >
              {HAND_ICON.rock}
            </button>
            <button
              className={styles.handButton}
              onClick={() => playGame('paper')}
              aria-label="パー"
            >
              {HAND_ICON.paper}
            </button>
            <button
              className={styles.handButton}
              onClick={() => playGame('scissors')}
              aria-label="チョキ"
            >
              {HAND_ICON.scissors}
            </button>
          </div>

          {result && playerHand && computerHand && (
            <div className={styles.result}>
              <div className={`${styles.resultText} ${styles[result]}`}>
                {RESULT_LABEL[result]}
              </div>
              <div className={styles.choices}>
                <div className={styles.choice}>
                  <div className={styles.choiceLabel}>あなた</div>
                  <div className={styles.choiceHand}>{HAND_ICON[playerHand]}</div>
                  <div style={{ color: 'white', fontWeight: 700, marginTop: '0.5rem', fontSize: '1.2rem' }}>
                    {HAND_LABEL[playerHand]}
                  </div>
                </div>
                <div className={styles.choice}>
                  <div className={styles.choiceLabel}>コンピュータ</div>
                  <div className={styles.choiceHand}>{HAND_ICON[computerHand]}</div>
                  <div style={{ color: 'white', fontWeight: 700, marginTop: '0.5rem', fontSize: '1.2rem' }}>
                    {HAND_LABEL[computerHand]}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Stats */}
      <div className={styles.statsPanel}>
        <h2 className={styles.statsTitle}>
          <IoStatsChart style={{ display: 'inline', marginRight: '0.5rem' }} />
          統計情報
        </h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statistics.totalGames}</div>
            <div className={styles.statLabel}>総試合数</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statistics.wins}</div>
            <div className={styles.statLabel}>勝ち</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statistics.losses}</div>
            <div className={styles.statLabel}>負け</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statistics.draws}</div>
            <div className={styles.statLabel}>あいこ</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{statistics.winRate.toFixed(1)}%</div>
            <div className={styles.statLabel}>勝率</div>
          </div>
        </div>
      </div>
    </div>
  );
}
