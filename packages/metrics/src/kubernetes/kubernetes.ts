const isRunningInKubernetes = () =>
  Boolean(process.env.KUBERNETES_SERVICE_HOST);

export { isRunningInKubernetes };
