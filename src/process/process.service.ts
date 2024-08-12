import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { JOB_EVERY, JOB_LEAGUES_BATCH_ID, JOB_LEAGUES_ID, JOB_OPTIONS, JOB_TEAMS_ID } from '../shared/constants/queue.jobs.constants';

@Injectable()
export class ProcessService {
  private isToggled = false;

  constructor(@InjectQueue('process') private readonly processQueue: Queue) {}

  async toggle(): Promise<boolean> {
    this.isToggled = !this.isToggled;
    try {
      this.isToggled ? await this.addJobs() : await this.removeJobs();

      return this.isToggled;
    } catch (e) {
      Logger.error('An error occurred while toggling the process.', e);
    }
  }

  async addJobs(): Promise<void> {
    try {
      const leaguesJob = await this.processQueue.add(JOB_LEAGUES_ID, {}, JOB_OPTIONS);
      const teamsJob = await this.processQueue.add(JOB_TEAMS_ID, { dependsOn: [leaguesJob.id] }, JOB_OPTIONS);
      await this.processQueue.add(JOB_LEAGUES_BATCH_ID, { dependsOn: [teamsJob.id] }, JOB_OPTIONS);
      Logger.debug('All jobs have been added to the queue.');
    } catch (error) {
      Logger.error('An error occurred while adding jobs to the queue.', error);
      throw error;
    }
  }

  async removeJobs(): Promise<void> {
    try {
      await this.processQueue.removeRepeatable(JOB_LEAGUES_ID, JOB_EVERY);
      await this.processQueue.removeRepeatable(JOB_TEAMS_ID, JOB_EVERY);
      await this.processQueue.removeRepeatable(JOB_LEAGUES_BATCH_ID, JOB_EVERY);
      await this.processQueue.clean(1);
    } catch (error) {
      Logger.error('Failed to remove jobs.', error);
    }
  }
}
