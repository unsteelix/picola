// export enum EFit {
//     cover = 'cover',
//     contain = 'contain',
//     fill = 'fill',
//     inside = 'inside',
//     outside = 'outside'
// }

// export enum EFormat {
//     jpeg = 'jpeg',
//     png = 'png',
//     webp = 'webp',
//     gif = 'gif',
//     avif = 'avif',
//     svg = 'svg',
//     tiff = 'tiff'
// }



  //     fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'

export interface IResizeOptions {
    width?: number,
    height?: number,
    fit?: any
}

export interface IJpegEngine {
    quality?: number
}

export interface IPngEngine {
    quality?: number
}

//  'jpeg' | 'png' | 'webp' | 'gif' | 'avif' | 'svg' | 'tiff'
export type IFormat = any

export type IEngineOptions = IJpegEngine | IPngEngine

export type IOtherOptions = { [key: string]: any }

export interface IOptions {
    format: IFormat
    resizeOptions: IResizeOptions
    engineOptions: IEngineOptions
    otherOptions: IOtherOptions
}