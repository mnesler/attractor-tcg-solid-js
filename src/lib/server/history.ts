import { createServerFn } from '@tanstack/solid-start'
import { readFile } from 'node:fs/promises'

export interface PipelineStage {
  node_id: string
  name: string
  started_at: string
  completed_at?: string
  status: string
  retries: number
  tool_calls: number
  llm_calls: number
  tokens_input: number
  tokens_output: number
  tokens_total: number
  duration_ms: number
  model?: string
  provider?: string
  tool_breakdown?: Record<string, number>
  estimated_cost_usd?: number
}

export interface PipelineRun {
  run_id: string
  name: string
  goal: string
  status: string
  started_at: string
  completed_at?: string
  duration_ms: number
  total_tool_calls: number
  total_llm_calls: number
  tokens_input: number
  tokens_output: number
  tokens_total: number
  stages: PipelineStage[]
  logs_root?: string
  model?: string
  provider?: string
  trigger?: string
  total_retries?: number
  estimated_cost_usd?: number
  tool_breakdown?: Record<string, number>
}

const HISTORY_FILE = '/home/maxwell/attractor/frontend-test-output/pipeline-history/runs.jsonl'

export const fetchPipelineHistory = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PipelineRun[]> => {
    try {
      const content = await readFile(HISTORY_FILE, 'utf-8')
      const lines = content.split('\n').filter(line => line.trim())
      
      const runs: PipelineRun[] = []
      for (const line of lines) {
        try {
          const run = JSON.parse(line) as PipelineRun
          runs.push(run)
        } catch {
          // Skip invalid JSON lines
        }
      }
      
      // Sort by started_at descending (most recent first)
      return runs.sort((a, b) => 
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )
    } catch (error) {
      // If file doesn't exist or can't be read, return empty array
      return []
    }
  }
)
