import { ThreadItemPoint } from "./ThreadItemPoint";
import { ThreadPoint } from "./ThreadPoint";
import { Thread } from "./Thread";
// import typeorm decorators
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
// validator for length
import { Length } from "class-validator";

// The Entity decorator tells TypeORM that the class that is about to be defined is an entity with the name Users.
@Entity({ name: "Users" })
export class User {
  @PrimaryGeneratedColumn({ name: "Id", type: "bigint" })
  id: string;

  @Column("varchar", {
    name: "Email",
    length: 120,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column("varchar", {
    name: "UserName",
    length: 60,
    unique: true,
    nullable: false,
  })
  userName: string;

  @Column("varchar", { name: "Password", length: 100, nullable: false })
  @Length(8, 100)
  password: string;

  @Column("boolean", { name: "Confirmed", default: false, nullable: false })
  confirmed: boolean;

  @Column("boolean", {
    name: "isDisabled",
    default: false,
    nullable: false,
  })
  isDisabled: boolean;

  @OneToMany(() => Thread, (thread) => thread.user)
  threads: Thread[];

  @OneToMany(() => ThreadPoint, (threadPoint) => threadPoint.user)
  threadPoints: ThreadPoint[];

  @OneToMany(() => ThreadItemPoint, (threadItemPoint) => threadItemPoint.user)
  threadItemPoints: ThreadItemPoint[];
}
