# Configuration du Webhook N8N pour le Chat

Ce document explique comment configurer N8N pour utiliser le système de webhook pour le chat.

## Architecture

Le système fonctionne de la manière suivante :

1. **Frontend** → Envoie une requête à N8N avec un `sessionId` unique et l'URL du webhook de retour
2. **N8N** → Traite la requête de manière asynchrone
3. **N8N** → Envoie la réponse via un webhook POST vers `/api/webhook/n8n`
4. **Frontend** → Récupère la réponse via polling sur `/api/chat/response?sessionId=xxx`

## Configuration N8N

### 1. Webhook de réception (déclencheur)

Créez un nœud **Webhook** dans N8N qui recevra les requêtes du frontend :

- **Méthode** : POST
- **Path** : `/response` (URL complète : `https://n8n.itdcmada.com/webhook-test/response`)
- **Response Mode** : Respond to Webhook

### 2. Traitement de la requête

Dans votre workflow N8N, vous recevrez les données suivantes :

```json
{
  "message": "Message de l'utilisateur",
  "sessionId": "chat-1234567890-abc123",
  "webhookUrl": "https://votre-domaine.com/api/webhook/n8n",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "bot", "content": "..." }
  ]
}
```

### 3. Envoi de la réponse via webhook

À la fin de votre workflow N8N, ajoutez un nœud **HTTP Request** pour envoyer la réponse :

- **Méthode** : POST
- **URL** : `{{ $json.webhookUrl }}` (ou utilisez directement l'URL : `https://votre-domaine.com/api/webhook/n8n`)
- **Body** :
```json
{
  "sessionId": "{{ $json.sessionId }}",
  "response": "Votre réponse ici",
  "status": "completed"
}
```

### 4. Gestion des erreurs

En cas d'erreur, envoyez :

```json
{
  "sessionId": "{{ $json.sessionId }}",
  "response": "Message d'erreur",
  "status": "error"
}
```

## Exemple de workflow N8N

```
1. Webhook (déclencheur) → Reçoit la requête du frontend
2. Traitement (IA, API, etc.) → Traite le message
3. HTTP Request → Envoie la réponse au webhook de retour
```

## Variables d'environnement

Dans votre fichier `.env.local` :

```env
NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL=https://n8n.itdcmada.com/webhook-test/response
```

## Format des réponses

Le webhook de retour attend les données suivantes :

- **sessionId** (requis) : L'ID de session fourni dans la requête initiale
- **response** (requis si status !== "error") : La réponse du bot
- **status** (optionnel, défaut: "completed") : "pending" | "completed" | "error"

## Test

Pour tester le système :

1. Envoyez un message depuis le chat
2. Vérifiez que N8N reçoit la requête avec le `sessionId`
3. Vérifiez que N8N envoie la réponse au webhook de retour
4. Le frontend devrait automatiquement récupérer la réponse via polling

## Dépannage

- **La réponse n'apparaît pas** : Vérifiez que N8N envoie bien la réponse au webhook avec le bon `sessionId`
- **Timeout** : Le polling s'arrête après 5 minutes. Vérifiez que votre workflow N8N répond dans ce délai
- **Erreurs** : Vérifiez les logs du serveur Next.js et de N8N

