export enum SqlEnum {
    login = `
        SELECT
            utuu."userId",
            utuu."name",
            utuu."email",
            utuu."password",
            utuu."isAdmin"
        FROM "user".tb_user_users utuu
        WHERE utuu."email" = $1 and 
            utuu."password" = $2
    `,
    register = `
        call "user".sp_usu_userpkg_agregarusuario($1, $2);
    `,
    getUserById = `
        
    `
}