# MTG Assistant Attractor Pipeline

This directory contains the Attractor DOT pipeline for the Magic: The Gathering deck building assistant.

## Overview

The `mtg-assistant.dot` pipeline uses the Kimi k2 model (via OpenRouter) to provide expert advice on Magic: The Gathering EDH/Commander decks.

## Pipeline Structure

```
start -> analyze -> success
```

- **start**: Entry point
- **analyze**: LLM node using `moonshot/kimi-k2` model
- **success**: Terminal node

## Configuration

### Environment Variables

The following environment variables are required in `.env`:

- `OPENROUTER_API_KEY`: Your OpenRouter API key

### Model Configuration

- **Model**: `moonshot/kimi-k2` (Kimi k2 via OpenRouter)
- **Max Tokens**: 1024
- **Temperature**: 0.7

## Usage

The pipeline is automatically called by the chat server (`src/lib/server/chat.ts`) when a user sends a message.

### Template Variables

The pipeline uses the following template variables that are replaced at runtime:

- `{{deck_context}}`: The user's current deck list
- `{{user_message}}`: The user's message/question

## Integration with Chat Server

The chat server integrates with this pipeline through the Attractor MCP:

1. **Load Pipeline**: Reads `mtg-assistant.dot`
2. **Replace Variables**: Substitutes deck context and user message
3. **Execute via MCP**: Calls the Attractor MCP `run_pipeline` tool at `http://127.0.0.1:3001/mcp`
4. **Return Response**: Extracts and returns the LLM response

## Troubleshooting

### MCP Server Not Running

If you get an error about the MCP server not running:

```bash
cd /home/maxwell/attractor
npm run mcp
```

### API Key Issues

Make sure your `.env` file contains the `OPENROUTER_API_KEY`:

```bash
cat .env | grep OPENROUTER_API_KEY
```

### Pipeline Validation

Test the pipeline manually using the Attractor MCP validation:

```bash
# The pipeline should have:
# - A start node (shape=circle, handler=start)
# - One or more processing nodes (handler=codergen)
# - A terminal node (shape=Msquare, handler=end)
```

## Model Information

The Kimi k2 model is accessed through OpenRouter:

- **Provider**: Moonshot AI
- **Model ID**: `moonshot/kimi-k2`
- **Context Length**: 32K tokens

## Future Enhancements

Possible improvements to the pipeline:

1. **Multi-stage Analysis**: Add nodes for different analysis types (card evaluation, synergy analysis, etc.)
2. **Conditional Routing**: Route to different nodes based on query type
3. **Context Enrichment**: Add a node to fetch card data from external APIs
4. **Response Formatting**: Add a post-processing node to format responses
5. **History Integration**: Link with the pipeline history viewer
