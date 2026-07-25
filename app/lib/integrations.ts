import { prisma } from './db';
import type { IntegrationDTO, IntegrationType, IntegrationConfig } from '@/app/types';

/** Включённые интеграции площадки по slug. */
export async function getIntegrations(slug: string): Promise<IntegrationDTO[]> {
  const site = await prisma.site.findUnique({
    where: { slug },
    include: { integrations: true },
  });
  if (!site) return [];
  return site.integrations.map((i) => ({
    id: i.id,
    type: i.type as IntegrationType,
    enabled: i.enabled,
    config: (i.config as IntegrationConfig) ?? {},
  }));
}

export function findConfig(integrations: IntegrationDTO[], type: IntegrationType): IntegrationConfig | null {
  const i = integrations.find((x) => x.type === type && x.enabled);
  return i ? i.config : null;
}
