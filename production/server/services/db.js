const mysql = require("mysql2/promise");
const { Client } = require("ssh2");
const net = require("net");

const createDbPool = () => {
    // 1. SSH Tunnel Mode (e.g. Combell)
    if (process.env.SSH_TUNNEL_ENABLED === "true") {
        console.log("Database: Initializing SSH Tunnel for database connection...");

        const sshConfig = {
            host: process.env.SSH_HOST,
            port: parseInt(process.env.SSH_PORT || "22", 10),
            username: process.env.SSH_USER,
        };

        if (process.env.SSH_PASSWORD) {
            sshConfig.password = process.env.SSH_PASSWORD;
        }
        if (process.env.SSH_PRIVATE_KEY) {
            sshConfig.privateKey = process.env.SSH_PRIVATE_KEY;
        }

        const sshClient = new Client();
        let localServer;
        let pool;

        const connectionPromise = new Promise((resolve, reject) => {
            sshClient
                .on("ready", () => {
                    console.log("SSH Tunnel: SSH connection established.");
                    
                    localServer = net.createServer((socket) => {
                        sshClient.forwardOut(
                            "127.0.0.1",
                            socket.remotePort,
                            process.env.DB_HOST,
                            parseInt(process.env.DB_PORT || "3306", 10),
                            (err, sshStream) => {
                                if (err) {
                                    console.error("SSH Tunnel: Forwarding error:", err);
                                    socket.end();
                                    return;
                                }
                                socket.pipe(sshStream).pipe(socket);
                                socket.on("error", () => sshStream.destroy());
                                sshStream.on("error", () => socket.destroy());
                            }
                        );
                    });

                    localServer.listen(0, "127.0.0.1", () => {
                        const localPort = localServer.address().port;
                        console.log(`SSH Tunnel: Local bridge server listening on port ${localPort}`);

                        pool = mysql.createPool({
                            host: "127.0.0.1",
                            port: localPort,
                            user: process.env.DB_USER,
                            password: process.env.DB_PASSWORD,
                            database: process.env.DB_NAME,
                            // Optional: support SSL inside SSH tunnel if needed
                            ssl: process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : undefined
                        });
                        
                        resolve(pool);
                    });

                    localServer.on("error", (err) => {
                        console.error("SSH Tunnel: Local server error:", err);
                        reject(err);
                    });
                })
                .on("error", (err) => {
                    console.error("SSH Tunnel: SSH Client error:", err);
                    reject(err);
                })
                .connect(sshConfig);
        });

        return {
            query: async (...args) => {
                const activePool = await connectionPromise;
                return activePool.query(...args);
            },
            execute: async (...args) => {
                const activePool = await connectionPromise;
                return activePool.execute(...args);
            },
            getConnection: async () => {
                const activePool = await connectionPromise;
                return activePool.getConnection();
            },
            end: async () => {
                if (pool) await pool.end();
                if (localServer) localServer.close();
                sshClient.end();
            }
        };
    }

    // 2. Direct Connection Mode (e.g. Local development OR Aiven.io)
    console.log("Database: Connecting directly to MySQL...");
    
    const poolConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "3306", 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };

    // If using Aiven, we must provide the CA certificate.
    // If DB_SSL_CA is set, apply SSL settings.
    if (process.env.DB_SSL_CA) {
        poolConfig.ssl = {
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
            ca: process.env.DB_SSL_CA, // Raw content of ca.pem file
        };
    }

    return mysql.createPool(poolConfig);
};

const db = createDbPool();
module.exports = db;
