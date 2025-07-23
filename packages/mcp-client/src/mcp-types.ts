// MCP (Multi-Agent Communication Protocol) types
export interface MCPMessage {
  id: string;
  type: "task" | "result" | "error" | "status";
  agentId: string;
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

export interface MCPResponse {
  success: boolean;
  data: any;
  error: string | null;
}

export interface MCPAgent {
  id: string;
  name: string;
  type: "PDA" | "VEA" | "OPA" | "CEA" | "AFLA" | "CGN" | "ALO";
  status: "active" | "inactive" | "busy";
}
