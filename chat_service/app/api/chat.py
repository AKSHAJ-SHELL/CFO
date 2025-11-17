"""
WebSocket chat endpoint
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.chat_agent import get_agent
from app.schemas.chat import ChatMessage

router = APIRouter()


@router.websocket("/chat")
async def websocket_chat(ws: WebSocket):
    """
    WebSocket streaming chat endpoint with source citations.
    
    Client sends: {"text": "<user message>", "conv_id": "<optional>"}
    Server streams: 
    - {"type": "chunk", "text": "..."} repeated
    - {"type": "sources", "sources": [...]} once at the end
    - {"type": "done"} when complete
    """
    await ws.accept()
    agent = get_agent()

    try:
        while True:
            # Receive message from client
            data = await ws.receive_json()
            user_text = data.get("text", "")
            conv_id = data.get("conv_id")

            if not user_text:
                await ws.send_json({"type": "error", "message": "Empty message"})
                continue

            # Stream reply from agent
            full_response = ""
            sources = None
            
            async for chunk, chunk_sources in agent.stream_reply(user_text, conv_id=conv_id):
                if chunk_sources is not None:
                    # Sources received
                    sources = chunk_sources
                elif chunk:
                    # Text chunk
                    full_response += chunk
                    await ws.send_json({"type": "chunk", "text": chunk})

            # Send sources if available
            if sources:
                await ws.send_json({"type": "sources", "sources": sources})

            # Send done signal
            await ws.send_json({"type": "done"})

    except WebSocketDisconnect:
        return
    except Exception as e:
        try:
            await ws.send_json({"type": "error", "message": str(e)})
        except:
            pass
        await ws.close()

