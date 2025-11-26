import { MongoClient, Db } from "mongodb";
import { envGlobal } from "../config/env-global";

export enum MongoDBStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export class MongoDBClient {
  private client: MongoClient;
  private db: Db | null = null;
  private currentStatus: MongoDBStatus = MongoDBStatus.DISCONNECTED;
  private connectionAttempts = 0;
  private lastError: Error | null = null;

  constructor() {
    this.client = new MongoClient(envGlobal.MONGODB_URL, {
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    });

    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      this.connectionAttempts++;
      this.currentStatus = MongoDBStatus.CONNECTING;
      console.log(`[MongoDB] Connecting to database...`);

      await this.client.connect();
      this.db = this.client.db(envGlobal.MONGODB_DATABASE);
      this.currentStatus = MongoDBStatus.CONNECTED;
      this.lastError = null;

      console.log(
        `[MongoDB] Connected successfully! (attempt ${this.connectionAttempts})`,
      );
    } catch (error) {
      this.currentStatus = MongoDBStatus.ERROR;
      this.lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error('[MongoDB] Connection error:', this.lastError.message);

      // Retry connection after 5 seconds
      setTimeout(() => this.connect(), 5000);
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      // Return a proxy that waits for connection
      throw new Error('[MongoDB] Database not connected. Please ensure MongoDB is running and configured correctly.');
    }
    return this.db;
  }

  getDatabaseSync(): Db | null {
    return this.db;
  }

  getClient(): MongoClient {
    return this.client;
  }

  async waitForConnection(timeoutMs: number = 10000): Promise<Db> {
    const startTime = Date.now();

    while (!this.db && Date.now() - startTime < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.db) {
      throw new Error('[MongoDB] Connection timeout');
    }

    return this.db;
  }

  getStatus(): MongoDBStatus {
    return this.currentStatus;
  }

  getLastError(): Error | null {
    return this.lastError;
  }

  getConnectionAttempts(): number {
    return this.connectionAttempts;
  }

  isConnected(): boolean {
    return this.currentStatus === MongoDBStatus.CONNECTED;
  }

  async healthCheck(): Promise<{
    status: MongoDBStatus;
    isHealthy: boolean;
    latencyMs: number | null;
    error: string | null;
  }> {
    try {
      const start = Date.now();
      await this.client.db('admin').command({ ping: 1 });
      const latencyMs = Date.now() - start;

      return {
        status: this.currentStatus,
        isHealthy: true,
        latencyMs,
        error: null,
      };
    } catch (error) {
      return {
        status: this.currentStatus,
        isHealthy: false,
        latencyMs: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async disconnect(): Promise<void> {
    console.log('[MongoDB] Disconnecting...');
    await this.client.close();
    this.currentStatus = MongoDBStatus.DISCONNECTED;
    this.db = null;
  }
}

export const mongoDBClient = new MongoDBClient();
