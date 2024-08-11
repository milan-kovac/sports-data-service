import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Team } from 'src/team/team.entity';

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
    onDelete: 'CASCADE',
  })
  teams: Team[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
