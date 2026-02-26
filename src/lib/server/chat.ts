import { createServerFn } from '@tanstack/solid-start'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ChatMessage } from '../types'

interface ChatParams {
  messages: ChatMessage[]
  deckContext: string
}

interface ChatResult {
  content?: string
  error?: string
}

interface MCPRequest {
  jsonrpc: string
  id: string | number
  method: string
  params?: Record<string, unknown>
}

interface MCPResponse {
  jsonrpc: string
  id: string | number
  result?: {
    content?: Array<{ type: string; text: string }>
  }
  error?: {
    code: number
    message: string
  }
}

// Attractor MCP client
async function callAttractorMCP(
  dotSource: string,
  workingDirectory?: string
): Promise<string> {
  const MCP_URL = 'http://127.0.0.1:3001/mcp'
  
  // Initialize session
  const initRequest: MCPRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'attractor-tcg-assistant',
        version: '1.0.0',
      },
    },
  }

  const initRes = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify(initRequest),
  })

  if (!initRes.ok) {
    throw new Error(`MCP initialization failed: ${initRes.statusText}`)
  }

  const initData = (await initRes.json()) as MCPResponse
  const sessionId = initRes.headers.get('mcp-session-id')
  
  if (!sessionId) {
    throw new Error('No session ID received from MCP server')
  }

  // Call run_pipeline tool
  const toolRequest: MCPRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'run_pipeline',
      arguments: {
        dot_source: dotSource,
        working_directory: workingDirectory,
      },
    },
  }

  const toolRes = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId,
    },
    body: JSON.stringify(toolRequest),
  })

  if (!toolRes.ok) {
    throw new Error(`MCP tool call failed: ${toolRes.statusText}`)
  }

  const toolData = (await toolRes.json()) as MCPResponse

  if (toolData.error) {
    throw new Error(`MCP error: ${toolData.error.message}`)
  }

  const content = toolData.result?.content?.[0]?.text
  if (!content) {
    throw new Error('No content received from MCP')
  }

  return content
}

export const sendChatMessage = createServerFn({ method: 'POST' }).handler(
  async (ctx): Promise<ChatResult> => {
    const params = (ctx.data as unknown) as ChatParams

    // Get the last user message
    const lastMessage = params.messages[params.messages.length - 1]
    const userMessage = lastMessage?.content || ''

    try {
      // Read the pipeline template
      const pipelinePath = join(process.cwd(), 'pipelines', 'mtg-assistant.dot')
      let dotSource = await readFile(pipelinePath, 'utf-8')

      // Replace template variables
      dotSource = dotSource
        .replace('{{deck_context}}', params.deckContext)
        .replace('{{user_message}}', userMessage)

      // Call Attractor MCP to run the pipeline
      const result = await callAttractorMCP(dotSource, process.cwd())

      // Parse the result to extract the assistant's response
      // The result contains execution logs, we need to extract the actual LLM output
      const lines = result.split('\n')
      const statusLine = lines.find(line => line.startsWith('Status:'))
      
      if (statusLine && !statusLine.includes('success')) {
        return {
          error: 'Pipeline execution failed. Check Attractor MCP logs.',
        }
      }

      // For now, return the full pipeline output
      // TODO: Parse the actual LLM response from the pipeline result
      return {
        content: result,
      }
    } catch (err) {
      console.error('Attractor MCP error:', err)
      
      if (
        err instanceof Error &&
        (err.message.includes('fetch failed') ||
          err.message.includes('ECONNREFUSED'))
      ) {
        return {
          error:
            'Attractor MCP server is not running. Start it with: cd /home/maxwell/attractor && npm run mcp',
        }
      }
      
      return {
        error: `Failed to process request: ${err instanceof Error ? err.message : String(err)}`,
      }
    }
  }
)
