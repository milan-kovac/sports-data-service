import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { League } from 'src/league/league.entity';

@Entity('team')
@Unique(['externalId', 'league'])
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  externalId: number;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  stadium: string;

  @ManyToOne(() => League, (league) => league.teams)
  league: League;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
