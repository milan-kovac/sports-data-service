import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique } from 'typeorm';
import { Team } from 'src/team/team.entity';

@Entity('League')
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
}
