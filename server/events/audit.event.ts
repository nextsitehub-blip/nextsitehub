import { EventEmitter } from "events";
import { DB } from "../repositories/firestore.repository";

class AuditEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.registerListeners();
  }

  private registerListeners() {
    this.on("auth.login", (data: { email: string; role: string; ip: string }) => {
      DB.log("action", `EVENT: Login success for ${data.email} (${data.role}) from IP: ${data.ip}`);
    });

    this.on("auth.failed", (data: { email: string; ip: string; reason: string }) => {
      DB.log("warning", `EVENT: Login failure for ${data.email} from IP: ${data.ip}. Reason: ${data.reason}`);
    });

    this.on("database.sync", (data: { collection: string; count: number }) => {
      DB.log("performance", `EVENT: Database collection synchronized. Collection: '${data.collection}' Count: ${data.count}`);
    });

    this.on("system.warning", (data: { component: string; message: string }) => {
      DB.log("warning", `EVENT: System warning emitted in ${data.component}: ${data.message}`);
    });
  }

  public emitLoginSuccess(email: string, role: string, ip: string) {
    this.emit("auth.login", { email, role, ip });
  }

  public emitLoginFailure(email: string, ip: string, reason: string) {
    this.emit("auth.failed", { email, ip, reason });
  }

  public emitDatabaseSync(collection: string, count: number) {
    this.emit("database.sync", { collection, count });
  }

  public emitSystemWarning(component: string, message: string) {
    this.emit("system.warning", { component, message });
  }
}

export const SystemEvents = new AuditEventEmitter();
