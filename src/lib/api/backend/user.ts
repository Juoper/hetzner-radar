import { generateIdFromEntropySize } from "./session";

export interface UserNotificationPreferences {
  email: boolean;
  discord: boolean;
}

export interface User {
  id: string;
  email: string;
  discord_webhook_url?: string | null;
  notification_preferences?: UserNotificationPreferences | null;
  created_at: string;
}

export async function getUserId(db: any, email: string): Promise<string> {
  return db
    .prepare("SELECT id FROM user WHERE email = ?")
    .bind(email)
    .first("id");
}

export async function getUser(db: any, userId: string): Promise<User | null> {
  const result = await db
    .prepare(
      "SELECT id, email, discord_webhook_url, notification_preferences, created_at FROM user WHERE id = ?",
    )
    .bind(userId)
    .first();

  if (!result) return null;

  return {
    ...result,
    notification_preferences: result.notification_preferences
      ? JSON.parse(result.notification_preferences)
      : { email: true, discord: false },
  };
}

export async function createUser(db: any, email: string) {
  const userId = generateIdFromEntropySize(10);
  await db
    .prepare("INSERT INTO user (id, email) VALUES (?, ?)")
    .bind(userId, email)
    .run();
  return userId;
}

export async function updateUserDiscordWebhook(
  db: any,
  userId: string,
  webhookUrl: string | null,
) {
  await db
    .prepare("UPDATE user SET discord_webhook_url = ? WHERE id = ?")
    .bind(webhookUrl, userId)
    .run();
}

export async function updateUserNotificationPreferences(
  db: any,
  userId: string,
  preferences: UserNotificationPreferences,
) {
  await db
    .prepare("UPDATE user SET notification_preferences = ? WHERE id = ?")
    .bind(JSON.stringify(preferences), userId)
    .run();
}

export function validateDiscordWebhookUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "discord.com" || urlObj.hostname === "discordapp.com"
    );
  } catch {
    return false;
  }
}
