# Telegram MCP Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-green.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Production-ready MCP server for the complete Telegram Bot API. **161 methods** with token-optimized meta mode (~157 tokens vs ~55,000).

## Highlights

- **Complete API coverage** — All 161 Telegram Bot API methods
- **Token efficient** — Meta mode reduces context by 99.7%
- **Production hardened** — Circuit breaker, rate limiting, retries with backoff
- **Observable** — Prometheus metrics, structured logging, health checks
- **Type safe** — Full TypeScript with Zod validation

## Quick Start

```bash
npm install && npm run build
```

Get your bot token from [@BotFather](https://t.me/BotFather), then add to your MCP config:

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["/path/to/build/index-meta.js"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Usage Modes

| Mode | Entry Point | Tools | Best For |
|------|-------------|-------|----------|
| **Meta** (recommended) | `index-meta.js` | 2 | Production — minimal token usage |
| Standard | `index.js` | 161 | Development — direct tool access |

**Meta mode** exposes just 2 tools:
- `telegram_find` — Search methods by name or category
- `telegram_call` — Execute any Telegram API method

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | **required** | Bot token from BotFather |
| `LOG_LEVEL` | `info` | debug / info / warning / error / critical |
| `REQUEST_TIMEOUT` | `30000` | Request timeout in ms (5000-120000) |
| `MAX_RETRIES` | `3` | Retry attempts (0-10) |
| `RATE_LIMIT_PER_MINUTE` | `30` | Global rate limit (1-60) |
| `HEALTH_PORT` | — | Enable health endpoints (/health, /metrics) |

## Features

### Resilience
- **Circuit breaker** — Opens after 5 failures, auto-recovers after 30s
- **Rate limiting** — Global + per-chat (respects Telegram limits)
- **Retries** — Exponential backoff with jitter

### Observability
- **Prometheus metrics** — Request counts, latencies, error rates
- **Health checks** — Kubernetes-ready readiness/liveness probes
- **Structured logging** — JSON format with automatic secret redaction

## API Reference

All 161 Telegram Bot API methods organized by category.

<details>
<summary><strong>Messages</strong> (22 methods)</summary>

| Method | Description |
|--------|-------------|
| `sendMessage` | Send text message |
| `sendPhoto` | Send photo |
| `sendVideo` | Send video |
| `sendAudio` | Send audio file |
| `sendDocument` | Send document/file |
| `sendAnimation` | Send GIF animation |
| `sendVoice` | Send voice message |
| `sendVideoNote` | Send video note (round video) |
| `sendLocation` | Send location |
| `sendVenue` | Send venue/place |
| `sendContact` | Send phone contact |
| `sendPoll` | Send poll/survey |
| `sendDice` | Send animated dice |
| `sendChatAction` | Send typing indicator |
| `sendMediaGroup` | Send media album |
| `sendPaidMedia` | Send paid media |
| `forwardMessage` | Forward message |
| `forwardMessages` | Forward multiple messages |
| `copyMessage` | Copy message |
| `copyMessages` | Copy multiple messages |
| `sendSticker` | Send sticker |
| `sendChecklist` | Send checklist (business) |

</details>

<details>
<summary><strong>Chat Management</strong> (30 methods)</summary>

| Method | Description |
|--------|-------------|
| `getChat` | Get chat info |
| `getChatMember` | Get member info |
| `getChatMemberCount` | Get member count |
| `getChatAdministrators` | List administrators |
| `banChatMember` | Ban user |
| `unbanChatMember` | Unban user |
| `restrictChatMember` | Restrict user |
| `promoteChatMember` | Promote to admin |
| `setChatAdministratorCustomTitle` | Set admin title |
| `setChatPermissions` | Set default permissions |
| `setChatTitle` | Set chat title |
| `setChatDescription` | Set chat description |
| `setChatPhoto` | Set chat photo |
| `deleteChatPhoto` | Delete chat photo |
| `pinChatMessage` | Pin message |
| `unpinChatMessage` | Unpin message |
| `unpinAllChatMessages` | Unpin all messages |
| `leaveChat` | Leave chat |
| `exportChatInviteLink` | Generate invite link |
| `createChatInviteLink` | Create invite link |
| `editChatInviteLink` | Edit invite link |
| `revokeChatInviteLink` | Revoke invite link |
| `approveChatJoinRequest` | Approve join request |
| `declineChatJoinRequest` | Decline join request |
| `banChatSenderChat` | Ban channel |
| `unbanChatSenderChat` | Unban channel |
| `setChatStickerSet` | Set sticker set |
| `deleteChatStickerSet` | Delete sticker set |
| `createChatSubscriptionInviteLink` | Create subscription link |
| `editChatSubscriptionInviteLink` | Edit subscription link |

</details>

<details>
<summary><strong>Editing</strong> (9 methods)</summary>

| Method | Description |
|--------|-------------|
| `editMessageText` | Edit text |
| `editMessageCaption` | Edit caption |
| `editMessageMedia` | Edit media |
| `editMessageReplyMarkup` | Edit keyboard |
| `editMessageLiveLocation` | Edit live location |
| `stopMessageLiveLocation` | Stop live location |
| `stopPoll` | Stop poll |
| `deleteMessage` | Delete message |
| `deleteMessages` | Delete multiple messages |

</details>

<details>
<summary><strong>Settings</strong> (16 methods)</summary>

| Method | Description |
|--------|-------------|
| `setMyCommands` | Set commands |
| `getMyCommands` | Get commands |
| `deleteMyCommands` | Delete commands |
| `setMyName` | Set bot name |
| `getMyName` | Get bot name |
| `setMyDescription` | Set description |
| `getMyDescription` | Get description |
| `setMyShortDescription` | Set short description |
| `getMyShortDescription` | Get short description |
| `setChatMenuButton` | Set menu button |
| `getChatMenuButton` | Get menu button |
| `setMyDefaultAdministratorRights` | Set default admin rights |
| `getMyDefaultAdministratorRights` | Get default admin rights |
| `getUserProfilePhotos` | Get user photos |
| `getFile` | Get file info |
| `setUserEmojiStatus` | Set emoji status |

</details>

<details>
<summary><strong>Business</strong> (16 methods)</summary>

| Method | Description |
|--------|-------------|
| `getBusinessConnection` | Get connection info |
| `readBusinessMessage` | Mark as read |
| `deleteBusinessMessages` | Delete messages |
| `setBusinessAccountName` | Set account name |
| `setBusinessAccountUsername` | Set username |
| `setBusinessAccountBio` | Set bio |
| `setBusinessAccountProfilePhoto` | Set profile photo |
| `removeBusinessAccountProfilePhoto` | Remove photo |
| `setBusinessAccountGiftSettings` | Set gift settings |
| `getBusinessAccountStarBalance` | Get star balance |
| `transferBusinessAccountStars` | Transfer stars |
| `postStory` | Post story |
| `editStory` | Edit story |
| `deleteStory` | Delete story |
| `repostStory` | Repost story |
| `approveSuggestedPost` | Approve post |
| `declineSuggestedPost` | Decline post |

</details>

<details>
<summary><strong>Stickers</strong> (16 methods)</summary>

| Method | Description |
|--------|-------------|
| `getStickerSet` | Get sticker set |
| `getCustomEmojiStickers` | Get custom emojis |
| `uploadStickerFile` | Upload sticker |
| `createNewStickerSet` | Create set |
| `addStickerToSet` | Add to set |
| `setStickerPositionInSet` | Move position |
| `deleteStickerFromSet` | Delete from set |
| `replaceStickerInSet` | Replace sticker |
| `setStickerEmojiList` | Set emojis |
| `setStickerKeywords` | Set keywords |
| `setStickerMaskPosition` | Set mask position |
| `setStickerSetTitle` | Set title |
| `setStickerSetThumbnail` | Set thumbnail |
| `setCustomEmojiStickerSetThumbnail` | Set emoji thumbnail |
| `deleteStickerSet` | Delete set |

</details>

<details>
<summary><strong>Forum Topics</strong> (13 methods)</summary>

| Method | Description |
|--------|-------------|
| `getForumTopicIconStickers` | Get icon stickers |
| `createForumTopic` | Create topic |
| `editForumTopic` | Edit topic |
| `closeForumTopic` | Close topic |
| `reopenForumTopic` | Reopen topic |
| `deleteForumTopic` | Delete topic |
| `unpinAllForumTopicMessages` | Unpin all |
| `editGeneralForumTopic` | Edit General |
| `closeGeneralForumTopic` | Close General |
| `reopenGeneralForumTopic` | Reopen General |
| `hideGeneralForumTopic` | Hide General |
| `unhideGeneralForumTopic` | Unhide General |
| `unpinAllGeneralForumTopicMessages` | Unpin General |

</details>

<details>
<summary><strong>Inline & Callbacks</strong> (6 methods)</summary>

| Method | Description |
|--------|-------------|
| `answerInlineQuery` | Answer inline query |
| `answerCallbackQuery` | Answer callback |
| `answerWebAppQuery` | Answer Web App |
| `savePreparedInlineMessage` | Save prepared message |
| `setMessageReaction` | Set reaction |
| `getUserChatBoosts` | Get user boosts |

</details>

<details>
<summary><strong>Payments</strong> (8 methods)</summary>

| Method | Description |
|--------|-------------|
| `sendInvoice` | Send invoice |
| `createInvoiceLink` | Create invoice link |
| `answerShippingQuery` | Answer shipping |
| `answerPreCheckoutQuery` | Answer pre-checkout |
| `getStarTransactions` | Get transactions |
| `refundStarPayment` | Refund payment |
| `editUserStarSubscription` | Edit subscription |
| `getMyStarBalance` | Get balance |

</details>

<details>
<summary><strong>Gifts</strong> (9 methods)</summary>

| Method | Description |
|--------|-------------|
| `getAvailableGifts` | Get available gifts |
| `sendGift` | Send gift |
| `giftPremiumSubscription` | Gift Premium |
| `getUserGifts` | Get user gifts |
| `getChatGifts` | Get chat gifts |
| `getBusinessAccountGifts` | Get business gifts |
| `convertGiftToStars` | Convert to stars |
| `upgradeGift` | Upgrade gift |
| `transferGift` | Transfer gift |

</details>

<details>
<summary><strong>Games</strong> (3 methods)</summary>

| Method | Description |
|--------|-------------|
| `sendGame` | Send game |
| `setGameScore` | Set score |
| `getGameHighScores` | Get high scores |

</details>

<details>
<summary><strong>Updates & Bot</strong> (7 methods)</summary>

| Method | Description |
|--------|-------------|
| `getUpdates` | Get updates (polling) |
| `setWebhook` | Set webhook |
| `deleteWebhook` | Delete webhook |
| `getWebhookInfo` | Get webhook info |
| `getMe` | Get bot info |
| `logOut` | Log out |
| `close` | Close instance |

</details>

<details>
<summary><strong>Verification & Passport</strong> (5 methods)</summary>

| Method | Description |
|--------|-------------|
| `verifyUser` | Verify user |
| `verifyChat` | Verify chat |
| `removeUserVerification` | Remove user verification |
| `removeChatVerification` | Remove chat verification |
| `setPassportDataErrors` | Set Passport errors |

</details>

## Development

```bash
npm test          # Run tests
npm run build     # Compile TypeScript
```

## License

MIT
