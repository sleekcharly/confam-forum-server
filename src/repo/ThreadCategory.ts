import { Thread } from "./Thread";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "ThreadCategories" })
export class ThreadCategory {
  @PrimaryGeneratedColumn({ name: "Id", type: "bigint" })
  // for typeorm
  id: string;

  @Column("varchar", {
    name: "Name",
    length: 100,
    unique: true,
    nullable: false,
  })
  name: string;

  @Column("varchar", {
    name: "Description",
    length: 150,
    nullable: true,
  })
  description: string;

  @OneToMany(() => Thread, (thread) => thread.category)
  threads: Thread[];
}
