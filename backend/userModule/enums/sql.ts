export enum SqlEnum {
    login = `
        
    `,
    register = `
        call "user".sp_usu_userpkg_agregarusuario($1, $2);
    `,
    getUserById = `
        
    `
}