// Store partagé pour les réponses de chat
// En production, remplacez par Redis ou une base de données

export interface ChatResponse {
  sessionId: string;
  response: string;
  timestamp: Date;
  status: "pending" | "completed" | "error";
}

class ChatStore {
  private store = new Map<string, ChatResponse>();

  // Nettoyer les réponses anciennes (plus de 1 heure)
  constructor() {
    setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      for (const [sessionId, response] of this.store.entries()) {
        if (response.timestamp.getTime() < oneHourAgo) {
          this.store.delete(sessionId);
        }
      }
    }, 60 * 60 * 1000); // Nettoyer toutes les heures
  }

  set(sessionId: string, response: ChatResponse): void {
    this.store.set(sessionId, response);
  }

  get(sessionId: string): ChatResponse | undefined {
    return this.store.get(sessionId);
  }

  delete(sessionId: string): boolean {
    return this.store.delete(sessionId);
  }

  has(sessionId: string): boolean {
    return this.store.has(sessionId);
  }
}

// Instance singleton
export const chatStore = new ChatStore();

