"""Test sending a real message via API to verify Stage 1 response count."""

import asyncio
import json
import httpx


async def test_send_message():
    """Create a conversation and send a test message."""
    base_url = "http://localhost:8002"

    print("=" * 70)
    print("Testing API message sending")
    print("=" * 70)

    try:
        # Step 1: Create a conversation
        print("\n1. Creating new conversation...")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{base_url}/api/conversations",
                json={}
            )
            if response.status_code != 200:
                print(f"✗ Failed to create conversation: {response.status_code}")
                return

            conversation = response.json()
            conversation_id = conversation["id"]
            print(f"✓ Created conversation: {conversation_id}")

            # Step 2: Send a message
            print("\n2. Sending test message...")
            message_content = "What is 2+2?"

            response = await client.post(
                f"{base_url}/api/conversations/{conversation_id}/message",
                json={"content": message_content},
                timeout=120.0
            )

            if response.status_code != 200:
                print(f"✗ Failed to send message: {response.status_code}")
                print(response.text)
                return

            result = response.json()
            print(f"✓ Message sent successfully!\n")

            # Step 3: Analyze Stage 1 responses
            print("3. Analyzing Stage 1 responses:")
            stage1_results = result.get("stage1", [])
            print(f"   Number of models that responded: {len(stage1_results)}")

            if len(stage1_results) == 0:
                print("   ✗ NO MODELS RESPONDED!")
            else:
                for i, model_result in enumerate(stage1_results, 1):
                    model = model_result.get("model", "unknown")
                    response_preview = model_result.get("response", "")[:100]
                    print(f"\n   {i}. Model: {model}")
                    print(f"      Response preview: {response_preview}...")

            # Step 4: Check metadata
            print(f"\n4. Stage 2 - Peer Rankings:")
            stage2_results = result.get("stage2", [])
            print(f"   Number of rankings: {len(stage2_results)}")

            metadata = result.get("metadata", {})
            aggregate_rankings = metadata.get("aggregate_rankings", [])
            print(f"\n   Aggregate Rankings:")
            for i, ranking in enumerate(aggregate_rankings, 1):
                model = ranking.get("model", "unknown")
                avg_rank = ranking.get("average_rank", 0)
                count = ranking.get("rankings_count", 0)
                print(f"   {i}. {model} - Avg rank: {avg_rank} (based on {count} votes)")

            # Final result
            print(f"\n5. Stage 3 - Final Answer:")
            stage3_result = result.get("stage3", {})
            model_used = stage3_result.get("model", "unknown")
            answer = stage3_result.get("response", "")[:200]
            print(f"   Model used (Chairman): {model_used}")
            print(f"   Answer preview: {answer}...")

            print("\n" + "=" * 70)
            print("API test completed successfully!")
            print("=" * 70)

    except httpx.ReadTimeout:
        print("\n✗ Request timed out (this is normal if models are slow)")
        print("  Try again or check backend.log for details")
    except Exception as e:
        print(f"\n✗ Error during test: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_send_message())
