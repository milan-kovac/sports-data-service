import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { JOB_LEAGUES_PERIODIC_ID, JOB_LEAGUES_ID, JOB_TEAMS_ID } from '../shared/constants/queue.jobs.constants';

@Injectable()
export class ProcessService {
  private isToggled = false;

  constructor(@InjectQueue('process') private readonly processQueue: Queue) {}

  async toggle(): Promise<boolean> {
    this.isToggled = !this.isToggled;
    try {
      if (this.isToggled) {
        await this.addJobs();
        await this.jobScheduler();
      } else {
        await this.removeJobs();
      }
      return this.isToggled;
    } catch (e) {
      Logger.error('An error occurred while toggling the process.', e);
    }
  }
  async jobScheduler(): Promise<void> {
    const interval = setInterval(async () => {
      this.isToggled ? await this.addJobs() : clearInterval(interval);
    }, 300000);
  }

  async addJobs(): Promise<void> {
    try {
      await this.processQueue.add(JOB_LEAGUES_ID);
      await this.processQueue.add(JOB_TEAMS_ID);
      await this.processQueue.add(JOB_LEAGUES_PERIODIC_ID);
    } catch (error) {
      Logger.error('An error occurred while adding jobs to the queue.', error);
      throw error;
    }
  }

  async removeJobs(): Promise<void> {
    try {
      const jobs = await this.processQueue.getRepeatableJobs();
      for (const job of jobs) {
        await this.processQueue.removeRepeatableByKey(job.key);
      }
      await this.processQueue.clean(1);
    } catch (error) {
      Logger.error('Failed to remove jobs.', error);
    }
  }
}
