import { DataSource } from "typeorm"

export const myDataSource = new DataSource({
    type: "mysql",
    host: "mariadb",
    port: 3306,
    username: "root",
    password: "root",
    database: "chmura2",
    entities: ["src/entity/*.ts"],
    logging: true,
    synchronize: true,
});
