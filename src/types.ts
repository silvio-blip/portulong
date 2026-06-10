/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  filename: string;
  code: string;
}

export interface DiscordMessage {
  id: string;
  sender: string;
  avatarColor: string;
  timestamp: string;
  content: string;
  isBot: boolean;
  embed?: {
    title?: string;
    description?: string;
    color?: string;
  } | null;
}

export interface TerminalLog {
  id: string;
  type: "info" | "success" | "warning" | "error";
  time: string;
  message: string;
}

export interface DictionaryItem {
  portulong: string;
  python: string;
  category: "palavra-chave" | "embutido" | "discordia";
  description: string;
  example: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: string;
}
