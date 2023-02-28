import { DateTime } from 'luxon';

export class logger {
  private Storage: string;
  constructor() {
    this.Storage = `"INTRESING" program. RUNNING. TIME IS: ${DateTime.now().toHTTP()} \n \n`;
  }

  AddLog(Line: string) {
    this.Storage = this.Storage + `\n` + `[LOGS]: ` + Line;
    console.log(`[LOGS]: ${Line}`);
  }

  LogError(Line: string) {
    this.Storage = this.Storage + `\n` + `[ERROR]: ` + Line;
    console.log(`[ERROR]: ${Line}`);
  }

  LogFunction(FUNC: () => any): void {
    const start: number = DateTime.now().toSeconds();
    try {
      const resp: any = FUNC();
      const end: number = DateTime.now().toSeconds() - start;
      this.AddLog(`Finished function. EXECUTION TIME: ${end}`);
    } catch (err) {
      const end: number = DateTime.now().toSeconds() - start;
      this.LogError(`Failed to finish. EXECUTION TIME: ${end} ERROR: ${err}`);
    }
  }

  Export() {
    return this.Storage;
  }
}
