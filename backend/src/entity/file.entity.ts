import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
    @PrimaryGeneratedColumn('increment')
    public id: number = 0;

    @Column('varchar', { nullable: false, length: 1023 })
    public filename: string = '';

    @Column('varchar', { nullable: false, length: 1023 })
    public s3link: string = '';
    
    @Column('varchar', { nullable: false, length: 255 })
    public s3key: string = '';
};
