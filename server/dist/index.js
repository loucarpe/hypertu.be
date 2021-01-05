"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const express_session_1 = __importDefault(require("express-session"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const passport_1 = __importDefault(require("passport"));
const cron_1 = require("cron");
const dotenv_1 = __importDefault(require("dotenv"));
const moment_1 = __importDefault(require("moment"));
const yaml_1 = __importDefault(require("yaml"));
const cors_1 = __importDefault(require("cors"));
const subtitles = __importStar(require("./utils/subtitles"));
const mailer_1 = require("./utils/mailer");
const router_1 = __importDefault(require("./routes/router"));
const logger_1 = __importDefault(require("./utils/logger"));
const loaders = [];
logger_1.default.info('[Express] starting...');
/******************/
/* Initialization */
/******************/
// Load .env file into `process.env`
if (!fs_1.default.existsSync('.env')) {
    logger_1.default.error('[Express] missing .env file');
    process.exit(1);
}
dotenv_1.default.config();
// Express App
const app = express_1.default();
const port = parseInt(process.env.NODE_PORT || process.env.PORT || '5000');
// Define urls based on NODE_ENV
process.env.BASE_URL = /*process.env.NODE_ENV === 'production' ? 'https://api.hypertu.be' : */ `http://localhost:${port}`;
process.env.FRONT_URL = /*process.env.NODE_ENV === 'production' ? 'https://hypertu.be' : */ 'http://localhost:3000';
// Initializers
mailer_1.Mail.init();
loaders.push(subtitles.init());
// Cron task
var job = new cron_1.CronJob('42 0 * * *', () => {
    const isTooOld = (filepath) => {
        const atime = moment_1.default(fs_1.default.statSync(filepath).atime);
        const diff = atime.diff(Date.now()); // in milliseconds
        return diff < -(moment_1.default(0).add(1, 'month').valueOf()); // 1 month
    };
    const root = '/tmp/hypertube_torrents';
    const torrents = fs_1.default.readdirSync(root);
    for (let torrent of torrents) {
        const path = `${root}/${torrent}`;
        if (fs_1.default.statSync(path).isDirectory()) {
            const files = fs_1.default.readdirSync(path);
            for (let file of files) {
                const filepath = `${root}/${torrent}/${file}`;
                if (isTooOld(filepath))
                    fs_1.default.unlinkSync(filepath);
            }
            if (fs_1.default.readdirSync(path).length <= 0)
                fs_1.default.rmdirSync(path);
        }
        else {
            if (isTooOld(path))
                fs_1.default.unlinkSync(path);
        }
    }
}, () => { }, true, 'Europe/Paris');
job.start();
// Init Passport
require('./utils/passport');
/***************/
/* Middlewares */
/***************/
// View engine
app.set('view engine', 'ejs');
// Body parsing
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
// Session
app.use(express_session_1.default({
    secret: 'hypertu.be',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
// CORS
app.use(cors_1.default());
// Handle invalid json error
app.use((error, req, res, next) => {
    if (error != null && error instanceof SyntaxError) {
        return res.status(422).json({
            error: 'invalid json'
        });
    }
    return next();
});
// Use Passport
app.use(passport_1.default.initialize());
// Others
app.use(function (req, res, next) {
    res.removeHeader('X-Powered-By');
    logger_1.default.info(`[Express] ${req.method} ${req.url} ${req.ip}`);
    return next();
});
/*****************/
/* Static assets */
/*****************/
// Bind assets directory
app.use('/assets', express_1.default.static('assets/'));
// Create directories if not exists
if (!fs_1.default.existsSync('assets')) {
    fs_1.default.mkdirSync('assets');
}
if (!fs_1.default.existsSync('assets/avatar')) {
    fs_1.default.mkdirSync('assets/avatar');
}
/**********/
/* Router */
/**********/
// Bind every routes of api
app.use(router_1.default());
/**************/
/* Swagger UI */
/**************/
// Read apidoc yaml file
const apidoc = fs_1.default.readFileSync('./apidoc.yml').toString();
// Serve swagger resources
app.use(swagger_ui_express_1.default.serve);
// Bind '/' on Swagger UI
app.get('/', swagger_ui_express_1.default.setup(yaml_1.default.parse(apidoc), {
    customSiteTitle: 'Hypertube API',
    customfavIcon: '/assets/images/favicon.png',
    customJs: '/assets/js/swagger.js'
}));
/*******************/
/* MongoDB & Start */
/*******************/
logger_1.default.info('[MongoDB] connection...');
// Connect to mongodb
// if success: start server
// else: stop server
mongoose_1.default.connect('mongodb://localhost/hypertube', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}, err => {
    if (err) {
        logger_1.default.error('[MongoDB] connection failed');
        process.exit(1);
    }
    else {
        logger_1.default.info('[MongoDB] connected');
        Promise.all(loaders).then(() => {
            app.listen(port, () => {
                logger_1.default.info(`[Express] started on port ${port}`);
            });
        });
    }
});
