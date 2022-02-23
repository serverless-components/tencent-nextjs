"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInjection = exports.getCodeZipPath = exports.validateTraffic = exports.removeAppid = exports.getDefaultServiceDescription = exports.getDefaultServiceName = exports.getDefaultFunctionName = exports.getDefaultProtocol = exports.capitalString = exports.getType = exports.deepClone = exports.generateId = exports.sleep = void 0;
const error_1 = require("tencent-component-toolkit/lib/utils/error");
const download = require("download");
const fse = require("fs-extra");
const path = require("path");
const AdmZip = require("adm-zip");
const config_1 = require("./config");
const CONFIGS = config_1.getConfig();
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    });
}
exports.sleep = sleep;
const generateId = () => Math.random()
    .toString(36)
    .substring(6);
exports.generateId = generateId;
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
exports.deepClone = deepClone;
const getType = (obj) => {
    return Object.prototype.toString.call(obj).slice(8, -1);
};
exports.getType = getType;
const capitalString = (str) => {
    if (str.length < 2) {
        return str.toUpperCase();
    }
    return `${str[0].toUpperCase()}${str.slice(1)}`;
};
exports.capitalString = capitalString;
const getDefaultProtocol = (protocols) => {
    return String(protocols).includes('https') ? 'https' : 'http';
};
exports.getDefaultProtocol = getDefaultProtocol;
const getDefaultFunctionName = () => {
    return `${CONFIGS.framework}_${exports.generateId()}`;
};
exports.getDefaultFunctionName = getDefaultFunctionName;
const getDefaultServiceName = () => {
    return 'serverless';
};
exports.getDefaultServiceName = getDefaultServiceName;
const getDefaultServiceDescription = () => {
    return 'Created by Serverless Component';
};
exports.getDefaultServiceDescription = getDefaultServiceDescription;
const removeAppid = (str, appid) => {
    const suffix = `-${appid}`;
    if (!str || str.indexOf(suffix) === -1) {
        return str;
    }
    return str.slice(0, -suffix.length);
};
exports.removeAppid = removeAppid;
const validateTraffic = (num) => {
    if (exports.getType(num) !== 'Number') {
        throw new error_1.ApiTypeError(`PARAMETER_${CONFIGS.framework.toUpperCase()}_TRAFFIC`, 'traffic must be a number');
    }
    if (num < 0 || num > 1) {
        throw new error_1.ApiTypeError(`PARAMETER_${CONFIGS.framework.toUpperCase()}_TRAFFIC`, 'traffic must be a number between 0 and 1');
    }
    return true;
};
exports.validateTraffic = validateTraffic;
const generatePublicDir = (zipPath) => {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    const [entry] = entries.filter((e) => e.entryName === 'app/public/' && e.name === '');
    if (!entry) {
        const extraPublicPath = path.join(__dirname, '_fixtures/public');
        zip.addLocalFolder(extraPublicPath, 'app/public');
        zip.writeZip();
    }
};
const getCodeZipPath = async (inputs) => {
    var _a;
    const { framework } = CONFIGS;
    console.log(`Packaging ${framework} application`);
    // unzip source zip file
    let zipPath;
    if (!((_a = inputs.code) === null || _a === void 0 ? void 0 : _a.src)) {
        // add default template
        const downloadPath = `/tmp/${exports.generateId()}`;
        const filename = 'template';
        console.log(`Installing Default ${framework} App`);
        try {
            await download(CONFIGS.templateUrl, downloadPath, {
                filename: `${filename}.zip`,
            });
        }
        catch (e) {
            throw new error_1.ApiTypeError(`DOWNLOAD_TEMPLATE`, 'Download default template failed.');
        }
        zipPath = `${downloadPath}/${filename}.zip`;
    }
    else {
        zipPath = inputs.code.src;
    }
    // 自动注入 public 目录
    if (framework === 'egg') {
        generatePublicDir(zipPath);
    }
    return zipPath;
};
exports.getCodeZipPath = getCodeZipPath;
const modifyDjangoEntryFile = (projectName, shimPath) => {
    console.log(`Modifying django entry file for project ${projectName}`);
    const compShimsPath = `/tmp/_shims`;
    const fixturePath = path.join(__dirname, '_fixtures/python');
    fse.copySync(shimPath, compShimsPath);
    fse.copySync(fixturePath, compShimsPath);
    // replace {{django_project}} in _shims/index.py to djangoProjectName
    const indexPath = path.join(compShimsPath, 'sl_handler.py');
    const indexPyFile = fse.readFileSync(indexPath, 'utf8');
    const replacedFile = indexPyFile.replace(eval('/{{django_project}}/g'), projectName);
    fse.writeFileSync(indexPath, replacedFile);
    return compShimsPath;
};
const getDirFiles = (dirPath) => {
    const targetPath = path.resolve(dirPath);
    const files = fse.readdirSync(targetPath);
    const temp = {};
    files.forEach((file) => {
        temp[file] = path.join(targetPath, file);
    });
    return temp;
};
const getInjection = (instance, inputs) => {
    const { framework } = CONFIGS;
    let injectFiles = {};
    let injectDirs = {};
    const shimPath = path.join(__dirname, '_shims');
    if (CONFIGS.injectSlsSdk) {
        injectFiles = instance.getSDKEntries(`_shims/handler.handler`);
        injectDirs = {
            _shims: shimPath,
        };
    }
    else if (framework === 'django') {
        const djangoShimPath = modifyDjangoEntryFile(inputs.projectName, shimPath);
        injectDirs = {
            '': djangoShimPath,
        };
    }
    else if (framework === 'flask') {
        injectDirs = {
            '': path.join(__dirname, '_fixtures/python'),
        };
        injectFiles = getDirFiles(shimPath);
    }
    else {
        injectFiles = getDirFiles(shimPath);
    }
    return { injectFiles, injectDirs };
};
exports.getInjection = getInjection;
