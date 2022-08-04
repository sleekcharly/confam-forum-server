// Inherit from TYPEORM base Entity
// Auditable , also extends the TypeORM base class called
// BaseEntity . This BaseEntity inheritance is what allows our entities to access
// the Postgres database through TypeORM

import { Column, BaseEntity } from "typeorm";

export class Auditable extends BaseEntity {
  @Column("varchar", {
    name: "CreatedBy",
    length: 60,
    default: () => `getpgusername()`,
    nullable: false,
  })
  createdBy: string;

  @Column("timestamp with time zone", {
    name: "CreatedOn",
    default: () => `now()`,
    nullable: false,
  })
  createdOn: Date;

  @Column("varchar", {
    name: "LastModifiedBy",
    length: 60,
    default: () => `getpgusername()`,
    nullable: false,
  })
  lastModifiedBy: string;

  @Column("timestamp with time zone", {
    name: "LastModifiedOn",
    default: () => `now()`,
    nullable: false,
  })
  lastModifiedOn: Date;
}
