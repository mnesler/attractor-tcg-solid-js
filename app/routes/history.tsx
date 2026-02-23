import { createFileRoute } from '@tanstack/solid-router'
import { createResource, For, Show } from 'solid-js'
import { fetchPipelineHistory, type PipelineRun } from '~/lib/server/history'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

type AnyServerFnCall = (opts?: { data?: unknown }) => Promise<unknown>

async function callFetchHistory() {
  return (fetchPipelineHistory as AnyServerFnCall)() as ReturnType<
    typeof fetchPipelineHistory
  >
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCost(cost: number | undefined): string {
  if (cost === undefined) return 'N/A'
  if (cost < 0.001) return '<$0.001'
  return `${cost.toFixed(3)}`
}

function formatToolBreakdown(breakdown: Record<string, number> | undefined): string {
  if (!breakdown || Object.keys(breakdown).length === 0) return 'N/A'
  return Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `${name}:${count}`)
    .join(' ')
}

function getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return 'status-completed'
    case 'failed':
    case 'error':
      return 'status-failed'
    case 'running':
    case 'in_progress':
      return 'status-running'
    default:
      return 'status-default'
  }
}

function HistoryTable(props: { runs: PipelineRun[] }) {
  return (
    <div class="history-table-wrapper">
      <table class="history-table">
        <thead>
          <tr>
            <th>Run Name</th>
            <th>Status</th>
            <th>Trigger</th>
            <th>Model</th>
            <th>Provider</th>
            <th>Started At</th>
            <th>Duration</th>
            <th>Est. Cost</th>
            <th>Retries</th>
            <th>Tool Breakdown</th>
            <th>Tool Calls</th>
            <th>LLM Calls</th>
            <th>Total Tokens</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.runs}>
            {(run) => (
              <tr>
                <td class="cell-name" title={run.goal}>
                  {run.name}
                </td>
                <td>
                  <span class={`status-badge ${getStatusClass(run.status)}`}>
                    {run.status}
                  </span>
                </td>
                <td class="cell-text">{run.trigger ?? 'N/A'}</td>
                <td class="cell-text">{run.model ?? 'N/A'}</td>
                <td class="cell-text">{run.provider ?? 'N/A'}</td>
                <td class="cell-date">{formatDate(run.started_at)}</td>
                <td class="cell-duration">{formatDuration(run.duration_ms)}</td>
                <td class="cell-cost">{formatCost(run.estimated_cost_usd)}</td>
                <td class="cell-number">{run.total_retries?.toLocaleString() ?? 'N/A'}</td>
                <td class="cell-breakdown" title={run.tool_breakdown ? JSON.stringify(run.tool_breakdown) : undefined}>
                  {formatToolBreakdown(run.tool_breakdown)}
                </td>
                <td class="cell-number">{run.total_tool_calls.toLocaleString()}</td>
                <td class="cell-number">{run.total_llm_calls.toLocaleString()}</td>
                <td class="cell-number">{run.tokens_total.toLocaleString()}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

function ShimmerTable() {
  return (
    <div class="history-table-wrapper">
      <div class="shimmer-table-header">
        <div class="shimmer-header-cell" style={{ width: '12%' }} />
        <div class="shimmer-header-cell" style={{ width: '8%' }} />
        <div class="shimmer-header-cell" style={{ width: '8%' }} />
        <div class="shimmer-header-cell" style={{ width: '10%' }} />
        <div class="shimmer-header-cell" style={{ width: '8%' }} />
        <div class="shimmer-header-cell" style={{ width: '12%' }} />
        <div class="shimmer-header-cell" style={{ width: '8%' }} />
        <div class="shimmer-header-cell" style={{ width: '8%' }} />
        <div class="shimmer-header-cell" style={{ width: '6%' }} />
        <div class="shimmer-header-cell" style={{ width: '10%' }} />
        <div class="shimmer-header-cell" style={{ width: '8%' }} />
        <div class="shimmer-header-cell" style={{ width: '8%' }} />
        <div class="shimmer-header-cell" style={{ width: '8%' }} />
      </div>
      <For each={Array.from({ length: 5 }, (_, i) => i)}>
        {(i) => (
          <div class="shimmer-table-row">
            <div class="shimmer-cell" style={{ width: '12%' }} />
            <div class="shimmer-cell" style={{ width: '8%' }} />
            <div class="shimmer-cell" style={{ width: '8%' }} />
            <div class="shimmer-cell" style={{ width: '10%' }} />
            <div class="shimmer-cell" style={{ width: '8%' }} />
            <div class="shimmer-cell" style={{ width: '12%' }} />
            <div class="shimmer-cell" style={{ width: '8%' }} />
            <div class="shimmer-cell" style={{ width: '8%' }} />
            <div class="shimmer-cell" style={{ width: '6%' }} />
            <div class="shimmer-cell" style={{ width: '10%' }} />
            <div class="shimmer-cell" style={{ width: '8%' }} />
            <div class="shimmer-cell" style={{ width: '8%' }} />
            <div class="shimmer-cell" style={{ width: '8%' }} />
          </div>
        )}
      </For>
    </div>
  )
}

function HistoryPage() {
  const [historyData] = createResource(callFetchHistory)

  return (
    <div class="history-page">
      <div class="history-header">
        <h1 class="history-title">Pipeline History</h1>
        <p class="history-subtitle">
          View all Attractor pipeline runs with their execution metrics
        </p>
      </div>

      <div class="history-card">
        <Show
          when={!historyData.loading && !historyData.error}
          fallback={
            <Show
              when={historyData.error}
              fallback={<ShimmerTable />}
            >
              <div class="history-error">
                <div class="error-icon">✦</div>
                <h2 class="error-title">Failed to load history</h2>
                <p class="error-message">
                  {String(historyData.error) || 'An unexpected error occurred.'}
                </p>
              </div>
            </Show>
          }
        >
          <Show
            when={historyData() && historyData()!.length > 0}
            fallback={
              <div class="history-empty">
                <div class="empty-icon">◉</div>
                <h2 class="empty-title">No pipeline runs found</h2>
                <p class="empty-message">
                  The pipeline history file is empty or could not be loaded.
                </p>
              </div>
            }
          >
            <HistoryTable runs={historyData()!} />
          </Show>
        </Show>
      </div>

      <style>{`
        .history-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: calc(100vh - 60px);
          padding: 3rem 2rem 2rem;
        }

        .history-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .history-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple), var(--neon-pink));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .history-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          max-width: 480px;
        }

        .history-card {
          width: 100%;
          max-width: 1200px;
          background: var(--bg-card);
          border: 1px solid var(--border-dim);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
          padding: 1.5rem;
        }

        .history-table-wrapper {
          overflow-x: auto;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .history-table th {
          text-align: left;
          padding: 0.875rem 1rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 0.75rem;
          border-bottom: 1px solid var(--border-dim);
          background: var(--bg-elevated);
          white-space: nowrap;
        }

        .history-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 45, 120, 0.1);
          color: var(--text-primary);
        }

        .history-table tbody tr {
          transition: background 0.2s ease;
        }

        .history-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .history-table tbody tr:last-child td {
          border-bottom: none;
        }

        .cell-name {
          font-weight: 500;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cell-date {
          white-space: nowrap;
          color: var(--text-muted);
        }

        .cell-duration {
          white-space: nowrap;
          font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
          color: var(--neon-cyan);
        }

        .cell-number {
          font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
          text-align: right;
          color: var(--text-muted);
        }

        .cell-text {
          white-space: nowrap;
          color: var(--text-secondary);
        }

        .cell-cost {
          font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
          text-align: right;
          color: var(--neon-green);
          white-space: nowrap;
        }

        .cell-breakdown {
          font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
          font-size: 0.75rem;
          color: var(--text-muted);
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .status-completed {
          background: rgba(57, 255, 20, 0.15);
          color: var(--neon-green);
          border: 1px solid rgba(57, 255, 20, 0.3);
        }

        .status-failed {
          background: rgba(255, 45, 120, 0.15);
          color: var(--neon-pink);
          border: 1px solid rgba(255, 45, 120, 0.3);
        }

        .status-running {
          background: rgba(0, 245, 255, 0.15);
          color: var(--neon-cyan);
          border: 1px solid rgba(0, 245, 255, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        .status-default {
          background: rgba(136, 136, 187, 0.15);
          color: var(--text-muted);
          border: 1px solid rgba(136, 136, 187, 0.3);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Shimmer loading styles */
        .shimmer-table-header {
          display: flex;
          padding: 0.875rem 1rem;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-dim);
          gap: 1rem;
        }

        .shimmer-header-cell {
          height: 12px;
          background: linear-gradient(90deg, #1A1A35 25%, #2D2D55 50%, #1A1A35 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 4px;
        }

        .shimmer-table-row {
          display: flex;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 45, 120, 0.1);
          gap: 1rem;
        }

        .shimmer-cell {
          height: 16px;
          background: linear-gradient(90deg, #1A1A35 25%, #2D2D55 50%, #1A1A35 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 4px;
        }

        /* Empty and error states */
        .history-empty,
        .history-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-icon,
        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-icon {
          color: var(--neon-cyan);
          text-shadow: var(--glow-cyan);
        }

        .error-icon {
          color: var(--neon-pink);
          text-shadow: var(--glow-pink);
        }

        .empty-title,
        .error-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-message,
        .error-message {
          color: var(--text-muted);
          max-width: 400px;
        }

        @media (max-width: 900px) {
          .history-card {
            padding: 1rem;
          }

          .history-table th,
          .history-table td {
            padding: 0.75rem 0.5rem;
          }

          .cell-name {
            max-width: 120px;
          }
        }
      `}</style>
    </div>
  )
}
