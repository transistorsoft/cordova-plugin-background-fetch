import { Component } from '@angular/core';
import BackgroundFetch from 'cordova-plugin-background-fetch';

interface LogEntry {
  ts: string;
  msg: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  log: LogEntry[] = [];

  constructor() {}

  private append(msg: string): void {
    const ts = new Date().toISOString().slice(11, 23);
    this.log = [{ ts, msg }, ...this.log].slice(0, 100);
  }

  async configure(): Promise<void> {
    this.append('configure() called');
    try {
      const status = await BackgroundFetch.configure(
        {
          minimumFetchInterval: 15,
          stopOnTerminate: false,
          startOnBoot: true,
          enableHeadless: false,
        },
        async (taskId: string) => {
          this.append(`fetch event: ${taskId}`);
          BackgroundFetch.finish(taskId);
        },
        async (taskId: string) => {
          this.append(`timeout: ${taskId}`);
          BackgroundFetch.finish(taskId);
        }
      );
      this.append(`configure ok, status=${status}`);
    } catch (e: any) {
      this.append(`configure error: ${e?.message ?? e}`);
    }
  }

  start(): void {
    BackgroundFetch.start(
      () => this.append('start ok'),
      (e: any) => this.append(`start error: ${e}`)
    );
  }

  stop(): void {
    BackgroundFetch.stop(
      () => this.append('stop ok'),
      (e: any) => this.append(`stop error: ${e}`)
    );
  }

  scheduleTask(): void {
    const taskId = 'com.transistorsoft.fetch.ionic.demo.task';
    BackgroundFetch.scheduleTask(
      {
        taskId,
        delay: 5000,
        periodic: false,
        stopOnTerminate: false,
        enableHeadless: false,
      },
      () => this.append(`scheduleTask ok: ${taskId}`),
      (e: any) => this.append(`scheduleTask error: ${e}`)
    );
  }

  status(): void {
    BackgroundFetch.status((status: number) => this.append(`status=${status}`));
  }
}
