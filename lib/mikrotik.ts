/**
 * MikroTik RouterOS REST API Integration
 * Handles all MikroTik operations: PPP secrets, address lists, queues, bandwidth monitoring
 */

export interface MikroTikConfig {
  ip: string;
  port?: number;
  username: string;
  password: string;
}

export class MikroTikAPI {
  private config: MikroTikConfig;
  private baseUrl: string;
  private auth: string;

  constructor(config: MikroTikConfig) {
    this.config = {
      port: 8728,
      ...config,
    };
    this.baseUrl = `http://${this.config.ip}:${this.config.port}/rest`;
    this.auth = Buffer.from(
      `${this.config.username}:${this.config.password}`
    ).toString("base64");
  }

  /**
   * Make HTTP request to MikroTik REST API
   */
  private async makeRequest(
    method: string,
    path: string,
    body?: Record<string, any>
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}${path}`;
      const options: RequestInit = {
        method,
        headers: {
          Authorization: `Basic ${this.auth}`,
          "Content-Type": "application/json",
        },
      };

      if (body && (method === "POST" || method === "PATCH")) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(
          `MikroTik API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`[MikroTik] Request failed: ${method} ${path}`, error);
      throw error;
    }
  }

  /**
   * Test connection to MikroTik router
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest("GET", "/system/identity");
      console.log("[MikroTik] Connection successful");
      return true;
    } catch (error) {
      console.error("[MikroTik] Connection failed:", error);
      return false;
    }
  }

  // ============ PPP OPERATIONS ============

  /**
   * Create a new PPP user (service activation)
   */
  async createPPPUser(
    username: string,
    password: string,
    profile: string = "default"
  ): Promise<string> {
    try {
      const response = await this.makeRequest("POST", "/ppp/secret", {
        name: username,
        password: password,
        profile: profile,
        service: "pppoe",
        disabled: false,
      });
      console.log(`[MikroTik] Created PPP user: ${username}`);
      return response;
    } catch (error) {
      console.error("[MikroTik] Error creating PPP user:", error);
      throw error;
    }
  }

  /**
   * Get all PPP users
   */
  async getPPPUsers(): Promise<any[]> {
    try {
      return await this.makeRequest("GET", "/ppp/secret");
    } catch (error) {
      console.error("[MikroTik] Error getting PPP users:", error);
      throw error;
    }
  }

  /**
   * Find PPP user by username
   */
  async findPPPUser(username: string): Promise<any | null> {
    try {
      const users = await this.getPPPUsers();
      return users.find((u) => u.name === username) || null;
    } catch (error) {
      console.error("[MikroTik] Error finding PPP user:", error);
      throw error;
    }
  }

  /**
   * Remove a PPP user (service deactivation)
   */
  async removePPPUser(username: string): Promise<boolean> {
    try {
      const user = await this.findPPPUser(username);
      if (!user) {
        console.warn(`[MikroTik] PPP user not found: ${username}`);
        return false;
      }

      await this.makeRequest("DELETE", `/ppp/secret/${user[".id"]}`);
      console.log(`[MikroTik] Removed PPP user: ${username}`);
      return true;
    } catch (error) {
      console.error("[MikroTik] Error removing PPP user:", error);
      throw error;
    }
  }

  /**
   * Disable a PPP user (for suspension)
   */
  async disablePPPUser(username: string): Promise<boolean> {
    try {
      const user = await this.findPPPUser(username);
      if (!user) {
        console.warn(`[MikroTik] PPP user not found: ${username}`);
        return false;
      }

      await this.makeRequest("PATCH", `/ppp/secret/${user[".id"]}`, {
        disabled: true,
      });
      console.log(`[MikroTik] Disabled PPP user: ${username}`);
      return true;
    } catch (error) {
      console.error("[MikroTik] Error disabling PPP user:", error);
      throw error;
    }
  }

  /**
   * Enable a PPP user (for unsuspending)
   */
  async enablePPPUser(username: string): Promise<boolean> {
    try {
      const user = await this.findPPPUser(username);
      if (!user) {
        console.warn(`[MikroTik] PPP user not found: ${username}`);
        return false;
      }

      await this.makeRequest("PATCH", `/ppp/secret/${user[".id"]}`, {
        disabled: false,
      });
      console.log(`[MikroTik] Enabled PPP user: ${username}`);
      return true;
    } catch (error) {
      console.error("[MikroTik] Error enabling PPP user:", error);
      throw error;
    }
  }

  /**
   * Update PPP user password
   */
  async updatePPPUserPassword(
    username: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const user = await this.findPPPUser(username);
      if (!user) {
        console.warn(`[MikroTik] PPP user not found: ${username}`);
        return false;
      }

      await this.makeRequest("PATCH", `/ppp/secret/${user[".id"]}`, {
        password: newPassword,
      });
      console.log(`[MikroTik] Updated password for PPP user: ${username}`);
      return true;
    } catch (error) {
      console.error("[MikroTik] Error updating PPP user password:", error);
      throw error;
    }
  }

  // ============ ADDRESS LIST OPERATIONS ============

  /**
   * Add IP address to Address List
   */
  async addToAddressList(
    listName: string,
    address: string,
    comment?: string
  ): Promise<string> {
    try {
      const response = await this.makeRequest(
        "POST",
        "/ip/firewall/address-list",
        {
          list: listName,
          address: address,
          comment: comment || "",
          disabled: false,
        }
      );
      console.log(
        `[MikroTik] Added address ${address} to list ${listName}`
      );
      return response;
    } catch (error) {
      console.error("[MikroTik] Error adding to address list:", error);
      throw error;
    }
  }

  /**
   * Remove IP address from Address List
   */
  async removeFromAddressList(
    listName: string,
    address: string
  ): Promise<boolean> {
    try {
      const items = await this.makeRequest(
        "GET",
        `/ip/firewall/address-list?list=${listName}&address=${address}`
      );

      if (!items || items.length === 0) {
        console.warn(
          `[MikroTik] Address not found: ${address} in list ${listName}`
        );
        return false;
      }

      await this.makeRequest(
        "DELETE",
        `/ip/firewall/address-list/${items[0][".id"]}`
      );
      console.log(
        `[MikroTik] Removed address ${address} from list ${listName}`
      );
      return true;
    } catch (error) {
      console.error("[MikroTik] Error removing from address list:", error);
      throw error;
    }
  }

  /**
   * Get all entries in Address List
   */
  async getAddressListEntries(listName: string): Promise<any[]> {
    try {
      return await this.makeRequest(
        "GET",
        `/ip/firewall/address-list?list=${listName}`
      );
    } catch (error) {
      console.error("[MikroTik] Error getting address list entries:", error);
      throw error;
    }
  }

  // ============ QUEUE OPERATIONS ============

  /**
   * Create a queue rule for rate limiting
   */
  async createQueue(
    name: string,
    targetAddress: string,
    downloadLimit: string,
    uploadLimit: string
  ): Promise<string> {
    try {
      const response = await this.makeRequest("POST", "/queue/simple", {
        name: name,
        target: targetAddress,
        "max-limit": `${downloadLimit}/${uploadLimit}`,
        disabled: false,
      });
      console.log(`[MikroTik] Created queue: ${name}`);
      return response;
    } catch (error) {
      console.error("[MikroTik] Error creating queue:", error);
      throw error;
    }
  }

  /**
   * Get all queues
   */
  async getQueues(): Promise<any[]> {
    try {
      return await this.makeRequest("GET", "/queue/simple");
    } catch (error) {
      console.error("[MikroTik] Error getting queues:", error);
      throw error;
    }
  }

  /**
   * Find queue by name
   */
  async findQueue(name: string): Promise<any | null> {
    try {
      const queues = await this.getQueues();
      return queues.find((q) => q.name === name) || null;
    } catch (error) {
      console.error("[MikroTik] Error finding queue:", error);
      throw error;
    }
  }

  /**
   * Update queue limits
   */
  async updateQueueLimits(
    name: string,
    downloadLimit: string,
    uploadLimit: string
  ): Promise<boolean> {
    try {
      const queue = await this.findQueue(name);
      if (!queue) {
        console.warn(`[MikroTik] Queue not found: ${name}`);
        return false;
      }

      await this.makeRequest("PATCH", `/queue/simple/${queue[".id"]}`, {
        "max-limit": `${downloadLimit}/${uploadLimit}`,
      });
      console.log(`[MikroTik] Updated queue limits: ${name}`);
      return true;
    } catch (error) {
      console.error("[MikroTik] Error updating queue limits:", error);
      throw error;
    }
  }

  /**
   * Remove a queue
   */
  async removeQueue(name: string): Promise<boolean> {
    try {
      const queue = await this.findQueue(name);
      if (!queue) {
        console.warn(`[MikroTik] Queue not found: ${name}`);
        return false;
      }

      await this.makeRequest("DELETE", `/queue/simple/${queue[".id"]}`);
      console.log(`[MikroTik] Removed queue: ${name}`);
      return true;
    } catch (error) {
      console.error("[MikroTik] Error removing queue:", error);
      throw error;
    }
  }

  // ============ MONITORING ============

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<any> {
    try {
      const info = await this.makeRequest("GET", "/system/identity");
      return info?.[0] || null;
    } catch (error) {
      console.error("[MikroTik] Error getting system info:", error);
      throw error;
    }
  }

  /**
   * Get interface statistics
   */
  async getInterfaceStats(): Promise<any[]> {
    try {
      return await this.makeRequest("GET", "/interface");
    } catch (error) {
      console.error("[MikroTik] Error getting interface stats:", error);
      throw error;
    }
  }
}

/**
 * Factory function to create MikroTik API instance
 */
export function getMikroTikInstance(config?: Partial<MikroTikConfig>): MikroTikAPI {
  const finalConfig: MikroTikConfig = {
    ip: config?.ip || process.env.MIKROTIK_IP || "192.168.1.1",
    port: config?.port || parseInt(process.env.MIKROTIK_PORT || "8728"),
    username: config?.username || process.env.MIKROTIK_USERNAME || "admin",
    password: config?.password || process.env.MIKROTIK_PASSWORD || "password",
  };

  return new MikroTikAPI(finalConfig);
}
