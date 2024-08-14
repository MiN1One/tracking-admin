module.exports = {
  apps: [
    {
      name: 'tracking-admin',
      script: 'serve',
      args: '-s build -l 4000',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};