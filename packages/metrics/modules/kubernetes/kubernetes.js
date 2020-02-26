const isRunningInKubernetes = () =>
  Boolean(process.env.KUBERNETES_SERVICE_HOST);

module.exports = {
  isRunningInKubernetes,
};
