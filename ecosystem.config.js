module.exports = {
  apps: [
    {
      name: 'ascend',
      script: 'node',
      args: 'node_modules/next/dist/bin/next start',
      cwd: '/Users/user/Documents/ASCEND/ascend-web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ASCEND_DB_PATH: '/Users/user/Documents/ASCEND/ascend.db',
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
