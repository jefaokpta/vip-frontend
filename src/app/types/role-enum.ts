export enum RoleEnum {
    // COMPANY — cumulativo (admin > supervisor > user)
    ROLE_COMPANY_USER = 'ROLE_COMPANY_USER',
    ROLE_COMPANY_SUPERVISOR = 'ROLE_COMPANY_SUPERVISOR',
    ROLE_COMPANY_ADMIN = 'ROLE_COMPANY_ADMIN',

    // TENANT — árvore de companies do tenant, cumulativo (support < finance < admin), igual COMPANY
    ROLE_TENANT_SUPPORT = 'ROLE_TENANT_SUPPORT',
    ROLE_TENANT_FINANCE = 'ROLE_TENANT_FINANCE',
    ROLE_TENANT_ADMIN = 'ROLE_TENANT_ADMIN',

    // GLOBAL — plataforma inteira, cumulativo (support < finance < admin), igual COMPANY
    //
    // Além do cumulativo dentro do próprio tier, cada role também herda todas as roles de
    // qualquer tier inferior (aplicado no backend em buildUserRoles()): GLOBAL herda TENANT e
    // COMPANY; TENANT herda COMPANY. É por isso que o item de menu "Tenants" — gated
    // ROLE_SAAS_SUPPORT, dentro de um grupo gated ROLE_COMPANY_ADMIN — é alcançável por um
    // usuário SAAS_SUPPORT: ele também herda ROLE_COMPANY_ADMIN.
    ROLE_SAAS_SUPPORT = 'ROLE_SAAS_SUPPORT',
    ROLE_SAAS_FINANCE = 'ROLE_SAAS_FINANCE',
    ROLE_SAAS_ADMIN = 'ROLE_SAAS_ADMIN'
}
