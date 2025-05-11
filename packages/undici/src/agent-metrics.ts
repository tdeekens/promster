import { Prometheus, defaultRegister } from '@promster/metrics';
import type {
  Agent as TUndiciAgent,
  Dispatcher as TUndiciDispatcher,
  Pool as TUndiciPool,
} from 'undici';

type TAgentMetricsExporterOptions = {
  metricPrefix?: string;
};
type TAgentStatsKeys = keyof TUndiciPool.PoolStats;

class ObservedAgents {
  private agents: TUndiciAgent[];

  constructor(initialAgents?: TUndiciAgent[]) {
    this.agents = [];

    if (initialAgents) {
      this.addMany(initialAgents);
    }
  }

  add(agent: TUndiciAgent): TUndiciAgent {
    this.agents.push(agent);

    return agent;
  }

  addMany(agents: TUndiciAgent[]): void {
    this.agents.push(...agents);
  }

  remove(agent: TUndiciAgent): boolean {
    const index = this.agents.indexOf(agent);
    if (index !== -1) {
      this.agents.splice(index, 1);
      return true;
    }
    return false;
  }

  get size(): number {
    return this.agents.length;
  }

  [Symbol.iterator](): IterableIterator<TUndiciAgent> {
    return this.agents.values();
  }
}

const observedAgents = new ObservedAgents();

function addObservedAgent(agent: TUndiciAgent) {
  return observedAgents.add(agent);
}

const supportedAgentStats: readonly TAgentStatsKeys[] = [
  'connected',
  'free',
  'pending',
  'queued',
  'running',
  'size',
];

function createAgentMetricsExporter(
  initialAgents?: TUndiciAgent[],
  options?: TAgentMetricsExporterOptions
): void {
  const metricName = `${options?.metricPrefix ?? ''}nodejs_undici_agent`;

  if (initialAgents) {
    observedAgents.addMany(initialAgents);
  }

  new Prometheus.Gauge({
    name: `${metricName}s_total`,
    help: 'Number of Undici agents.',
    registers: [defaultRegister],
    collect() {
      this.set(observedAgents.size);
    },
  });

  for (const supportedStat of supportedAgentStats) {
    new Prometheus.Gauge({
      name: `${metricName}_${supportedStat}`,
      help: `Statistics for Undici agents ${supportedStat} stat. See https://github.com/nodejs/undici/blob/main/docs/docs/api/Agent.md#agentstats`,
      labelNames: ['origin'],
      registers: [defaultRegister],
      collect() {
        for (const agent of observedAgents) {
          // If the agent has made no requests, it will not have stats
          if (!agent.stats) {
            continue;
          }

          for (const [origin, stats] of Object.entries(agent.stats)) {
            // Client stats do not have free property
            // @ts-expect-error
            const statValue = stats[supportedStat];

            if (typeof statValue === 'number' && !Number.isNaN(statValue)) {
              this.labels(origin).set(statValue);
            }
          }
        }
      },
    });
  }
}

export {
  createAgentMetricsExporter,
  supportedAgentStats,
  addObservedAgent,
  type TAgentMetricsExporterOptions,
};
