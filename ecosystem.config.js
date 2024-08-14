module.exports = {
  apps: [
    {
      name: 'tracking-admin',
      script: 'serve',
      args: '-s build',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};