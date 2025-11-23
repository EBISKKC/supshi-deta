'use client';

import { useState, useEffect } from 'react';
import styles from './DataTable.module.css';

interface DataTableProps {
  initialRange?: string;
}

export default function DataTable({ initialRange = 'Sheet1!A1:Z100' }: DataTableProps) {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [range, setRange] = useState(initialRange);

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/sheets?range=${encodeURIComponent(range)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      setData(result.values || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    if (!newData[rowIndex]) {
      newData[rowIndex] = [];
    }
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range,
          values: data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      alert('データを保存しました');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = async () => {
    const newRow = Array(data[0]?.length || 5).fill('');

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/sheets/append', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range,
          values: [newRow],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add row');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && data.length === 0) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Google Sheets データ管理</h1>
        <div className={styles.actions}>
          <button onClick={fetchData} className={styles.button} disabled={loading}>
            再読み込み
          </button>
          <button onClick={handleAddRow} className={styles.button} disabled={loading}>
            行を追加
          </button>
          <button onClick={handleSave} className={styles.button} disabled={loading}>
            保存
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {data.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              {data[0]?.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{rowIndex + 1}</td>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      className={styles.input}
                      value={cell || ''}
                      onChange={(e) => handleCellChange(rowIndex + 1, colIndex, e.target.value)}
                      onFocus={() => setEditingCell({ row: rowIndex + 1, col: colIndex })}
                      onBlur={() => setEditingCell(null)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
