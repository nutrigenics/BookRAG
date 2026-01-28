import { useState, useRef, useEffect } from 'react';
import { Message, Reference } from '../types';

export function useChatStream(currentBookId: string, t: any) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchStage, setSearchStage] = useState(0); // 0: Analyzing, 1: Consulting, 2: Generating, 3: Done

    const stopStreamRef = useRef<boolean>(false);

    const clearChat = () => {
        setMessages([]);
        stopStreamRef.current = true; // Stop any ongoing stream
    };

    const handleSubmit = async (queryOverride?: string) => {
        const finalQuery = (typeof queryOverride === 'string' ? queryOverride : input).trim();
        if (!finalQuery || loading) return;

        stopStreamRef.current = false;
        const query = finalQuery;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: query }]);
        setLoading(true);
        setSearchStage(0); // Start Analyzing

        try {
            // Use env variable or window.location.hostname
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:8000`;
            const response = await fetch(`${apiBaseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query,
                    mode: 'hybrid',
                    book_id: currentBookId, // Send selected book ID
                }),
            });

            if (stopStreamRef.current) {
                setLoading(false);
                return;
            }

            setSearchStage(1); // Consulting knowledge base (Stream started)
            await new Promise(resolve => setTimeout(resolve, 800)); // Minimum visual time for "Consulting" phase

            if (!response.ok) throw new Error('Network response was not ok');
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No reader');

            let startedStreaming = false;
            const contextMap = new Map<string, string>(); // Temporary storage for retrieved chunks
            let buffer = '';

            while (true) {
                if (stopStreamRef.current) {
                    reader.cancel();
                    break;
                }

                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);

                        if (json.type === 'context') {
                            setSearchStage(2); // Generating (Context received)
                            const chunks = json.data.chunks || json.data.text_chunks || [];

                            // Store chunks in map for lookup
                            chunks.forEach((c: { content?: string }) => {
                                if (!c.content) return;
                                const match = c.content.match(/\[(?:SOURCE:)?\s*Page\s*(\d+)\]/i);
                                if (match && match[1]) {
                                    contextMap.set(match[1], c.content);
                                }
                            });

                        } else if (json.type === 'delta') {
                            if (!startedStreaming) {
                                setSearchStage(2); // Generating (Ensure this step is visible)
                                await new Promise(resolve => setTimeout(resolve, 800));

                                setSearchStage(3); // All steps completed
                                await new Promise(resolve => setTimeout(resolve, 600));

                                setMessages(prev => [...prev, { role: 'assistant', content: '', references: [] }]);
                                startedStreaming = true;
                            }

                            setMessages(prev => {
                                const newHistory = [...prev];
                                const idx = newHistory.length - 1;
                                // Safety check: ensure we are updating the assistant message
                                if (newHistory[idx].role !== 'assistant') return newHistory;

                                const newContent = newHistory[idx].content + json.content;

                                newHistory[idx] = {
                                    ...newHistory[idx],
                                    content: newContent,
                                };

                                // Parsing Logic: Extract [Page N] from the accumulator text
                                const textRefs: Reference[] = [];
                                const pagePattern = /\[(?:SOURCE:)?\s*Page\s*(\d+)\]/gi;
                                const matches = [...newContent.matchAll(pagePattern)];

                                matches.forEach(m => {
                                    const pageNum = m[1];
                                    const fullText = contextMap.get(pageNum) || `Page ${pageNum}`;
                                    textRefs.push({
                                        page: pageNum,
                                        text: fullText
                                    });
                                });

                                // Deduplicate by PAGE NUMBER
                                const uniqueTextRefs = textRefs.filter((ref, index, self) =>
                                    index === self.findIndex((r) => r.page === ref.page)
                                );

                                if (uniqueTextRefs.length > 0) {
                                    newHistory[idx].references = uniqueTextRefs;
                                }

                                return newHistory;
                            });
                        }
                    } catch (err) {
                        console.error("Error parsing JSON chunk", err);
                    }
                }
            }

        } catch (error) {
            console.error("Error communicating with backend:", error);
            if (!stopStreamRef.current) {
                setMessages(prev => [...prev, { role: 'assistant', content: t.error }]);
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        messages,
        setMessages,
        input,
        setInput,
        loading,
        searchStage,
        handleSubmit,
        clearChat
    };
}
