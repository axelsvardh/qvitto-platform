// Extends app.json. GitHub Pages serves the staging web build under
// /qvitto-platform/, so the deploy workflow sets EXPO_BASE_URL; local dev
// leaves it unset and keeps "/" (spec 002).
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_BASE_URL;
  if (!baseUrl) return config;
  return { ...config, experiments: { ...config.experiments, baseUrl } };
};
