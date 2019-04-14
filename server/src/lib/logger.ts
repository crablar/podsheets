import * as winston from "winston";

export const logger = new winston.Logger({
    exitOnError: false,
    transports: [
        new winston.transports.Console({
            colorize: true,
            formatter: (options: any) => {
                const {level, message, meta, timestamp} = options;
                let metaFormatted = "";
                if (meta && Object.keys(meta).length) {
                    metaFormatted = "\n\t" + JSON.stringify(meta);
                }
                const colorizedTxt = (winston.config as any).colorize(level, `[${timestamp}] ${level.toUpperCase()}`);
                return `${colorizedTxt} ${message || ""} ${metaFormatted}`;
            },
            handleExceptions: true,
            json: false,
            level: "debug",
            prettyPrint: true,
            timestamp: new Date().toLocaleString(),
        }),
    ],
});

export const stream = {
    write: (message: string) => logger.info(message),
};
