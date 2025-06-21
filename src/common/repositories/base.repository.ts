import { InternalServerErrorException } from '@nestjs/common';
import {
  DataSource,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

// Error :Type 'T' does not satisfy the constraint 'ObjectLiteral'.ts(2344)
//You need to add a constraint to the generic type T so TypeORM knows it's dealing with an entity-like object. Repository<T> requires T to extend ObjectLiteral.

// Explanation:
// ObjectLiteral is a TypeORM utility type, essentially { [key: string]: any }.

// It ensures T is an object and not something like string, number, etc.

// This is a TypeScript constraint that allows Repository<T> to work correctly.

//!-------------------------------------------------------------------------------------------------------------
export class BaseRepository<T extends ObjectLiteral> {
  //constructor(private readonly repository: Repository<T>) {}

  // We need to store the DataSource to manage transactions
  protected readonly repository: Repository<T>; // ✅ Use protected or public  In TypeScript, private members must be declared in only one place when extending a class — or they are considered separate and incompatible.
  protected readonly dataSource: DataSource; // Added for transactions

  constructor(repository: Repository<T>, dataSource: DataSource) {
    // Accept DataSource in constructor
    this.repository = repository;
    this.dataSource = dataSource;
  }
  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create entity.');
    }
  }

  // FindManyOptions<T>  Used with .find() method.
  //Purpose: To specify filters, pagination, sorting, and relations when fetching multiple entities.
  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  //  FindOneOptions<T>  Used with .findOne() method.
  // Purpose:  To specify conditions and relation loading for fetching a single entity.
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    console.log('Base service options :  ', options);
    return await this.repository.findOne(options);
  }

  //FindOptionsWhere<T> is the go-to type for filtering data using find, findOne, update, delete, etc.
  //It gives you type safety and flexibility to write expressive queries.

  async update(where: FindOptionsWhere<T>, data: DeepPartial<T>): Promise<T> {
    try {
      // Use a transaction to ensure atomicity of update and subsequent fetch
      return await this.dataSource.transaction(
        async (transactionalEntityManager) => {
          // Perform the update using the transactional entity manager
          // Note: When using a transactionalEntityManager's createQueryBuilder,
          // you must specify the entity target explicitly.
          await transactionalEntityManager
            .createQueryBuilder(this.repository.target, 'entity') // 'entity' is an alias
            .update()
            .set(data as QueryDeepPartialEntity<T>)
            .where(where)
            .execute();

          // Fetch the updated entity using the same transactional entity manager.
          // This guarantees that we are reading the state as it was committed by the update
          // within this very transaction, avoiding race conditions.
          const updatedEntity = await transactionalEntityManager.findOneOrFail(
            this.repository.target, // Pass the entity target/constructor
            { where },
          );

          return updatedEntity;
        },
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to update entity.');
    }
  }
  async delete(where: FindOptionsWhere<T>): Promise<void> {
    const result = await this.repository.delete(where);

    if (result.affected === 0) {
      throw new Error('Entity not found or already deleted.');
    }
  }
}
