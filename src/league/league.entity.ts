import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique, CreateDateColumn, UpdateDateColumn, AfterInsert } from 'typeorm';
import { Team } from '../team/team.entity';

@Entity('league')
@Unique(['externalId'])
export class League {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  externalId: number;

  @Column()
  name: string;

  @Column()
  sport: string;

  @OneToMany(() => Team, (team) => team.league, {
    cascade: true,
  })
  teams: Team[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
