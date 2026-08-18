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
    ROLE_SAAS_SUPPORT = 'ROLE_SAAS_SUPPORT',
    ROLE_SAAS_FINANCE = 'ROLE_SAAS_FINANCE',
    ROLE_SAAS_ADMIN = 'ROLE_SAAS_ADMIN'


}
