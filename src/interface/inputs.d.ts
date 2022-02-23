export interface ScfInputs {
    entryFile?: string;
    code?: {
        bucket?: string;
        object?: string;
        src?: string;
    };
    name?: string;
    projectName?: string;
    djangoProjectName?: string;
    role?: string;
    serviceId?: string;
    handler?: string;
    runtime?: string;
    namespace?: string;
    description?: string;
    environment?: {
        variables?: Record<string, string>;
    };
    lastVersion?: string;
    layers?: [];
    cfs?: [];
    timeout?: number;
    traffic?: number;
    publish?: boolean;
    asyncRunEnable?: boolean;
    traceEnable?: boolean;
    memorySize?: number;
    tags?: {}[];
    vpc?: {
        vpcId: string;
        subnetId: string;
    };
    vpcConfig?: {
        vpcId: string;
        subnetId: string;
    };
    cls?: {
        logsetId: string;
        topicId: string;
    };
    needSetTraffic?: boolean | string;
}
export interface ApigwInputs {
    oldState?: any;
    isDisabled?: boolean;
    id?: string;
    name?: string;
    description?: string;
    serviceId?: string;
    serviceName?: string;
    serviceDesc?: string;
    qualifier?: string;
    environment?: 'prepub' | 'release' | 'test';
    customDomains?: {
        domain: string;
        protocols: ('http' | 'https')[];
        certificateId: string;
        isDefaultMapping?: boolean;
        pathMappingSet: [];
        netType: string;
        isForcedHttps: boolean;
    }[];
    path?: string;
    method?: string;
    cors?: boolean;
    enableCORS?: boolean;
    serviceTimeout?: number;
    timeout?: number;
    apiName?: string;
    isBase64Encoded?: boolean;
    protocols: ('http' | 'https')[];
    endpoints: {
        path?: string;
        cors?: boolean;
        enableCORS?: boolean;
        serviceTimeout?: number;
        timeout?: number;
        method?: string;
        apiName?: string;
        name?: string;
        isBase64Encoded?: boolean;
        isBase64Trigger?: {
            [propName: string]: any;
        };
        function?: {
            functionName: string;
            functionNamespace?: string;
            functionQualifier?: string;
            isIntegratedResponse?: boolean;
        };
        usagePlan?: {
            usagePlanId: string;
            usagePlanName: string;
            usagePlanDesc: string;
            maxRequestNum: number;
        };
        auth?: {
            secretName: string;
            secretIds?: string;
        };
    }[];
    function?: {
        functionQualifier: string;
    };
    usagePlan?: {
        usagePlanId: string;
        usagePlanName: string;
        usagePlanDesc: string;
        maxRequestNum: number;
    };
    auth?: {
        secretName: string;
        secretIds?: string;
    };
}
export interface CosInputs {
    replace?: boolean;
    bucket: string;
    sources?: {
        src: string;
        targetDir: string;
    }[];
}
export interface CdnInputs {
    domain: string;
    area?: string;
    autoRefresh?: boolean;
    onlyRefresh?: boolean;
    refreshType?: string;
    forceRedirect?: {
        switch?: 'on' | 'off' | undefined;
        redirectType?: 'https';
        redirectStatusCode: number;
    };
    https?: {
        switch?: 'on' | 'off' | undefined;
        http2?: 'on' | 'off' | undefined;
        certId: string;
    };
}
export interface StaticInputs {
    cosConf: CosInputs;
    cdnConf?: CdnInputs;
}
export interface SrcObject {
    src?: string;
    dist?: string;
    hook?: string;
    exclude?: string[];
    targetDir?: string;
    bucket?: string;
    object?: string;
}
export interface Inputs {
    entryFile?: string;
    projectName?: string;
    djangoProjectName?: string;
    serviceId?: string;
    functionConf?: ScfInputs;
    apigatewayConf?: ApigwInputs;
    vpc?: {
        vpcId: string;
        subnetId: string;
    };
    vpcConfig?: {
        vpcId: string;
        subnetId: string;
    };
    serviceName?: string;
    region?: string;
    src?: string | SrcObject;
    role?: string;
    handler?: string;
    runtime?: string;
    namespace?: string;
    srcOriginal?: {
        bucket: string;
        object: string;
    };
    functionName?: string;
    description?: string;
    publish?: string;
    traffic?: number;
    tags?: number;
    layers?: string[];
    staticConf?: StaticInputs;
}
export interface MetricsInputs {
    tz?: string;
    rangeStart?: string;
    rangeEnd?: string;
}
