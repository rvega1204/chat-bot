import cuncurrently from "concurrently";

cuncurrently(
  [
    {
      command: "cd packages/client && npm run dev",
      name: "client",
      prefixColor: "blue",
    },
    {
      command: "cd packages/server && npm run dev",
      name: "server",
      prefixColor: "green",
    },
  ],
  {
    prefix: "name",
    killOthers: ["failure", "success"],
    restartTries: 3,
  },
);
