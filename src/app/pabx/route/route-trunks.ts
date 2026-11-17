export type TrunkRow = { trunk1?: number | null; trunk2?: number | null; trunk3?: number | null };

/**
 * O botão de limpar do p-select deixa o tronco como null; o backend espera 0 para "sem tronco".
 */
export function withClearedTrunksAsZero<T extends { routeTrunks: TrunkRow[] }>(route: T): T {
    return {
        ...route,
        routeTrunks: route.routeTrunks.map((row) => ({
            ...row,
            trunk1: row.trunk1 ?? 0,
            trunk2: row.trunk2 ?? 0,
            trunk3: row.trunk3 ?? 0
        }))
    };
}
