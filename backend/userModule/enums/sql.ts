export enum SqlEnum {
    login = `
        SELECT
            utuu."userId",
            utuu."email",
            utuu."isAdmin"
        FROM "user".tb_user_users utuu
        WHERE utuu."email" = $1 and 
            utuu."password" = $2
    `,
    register = `
        call "user".sp_usu_userpkg_agregarusuario($1, $2);
    `,
    getUserById = `
        SELECT
            utuu."name",
            utuu."email",
            utuu."isAdmin"
        FROM "user".tb_user_users utuu
        WHERE utuu."userId" = $1
    `
}