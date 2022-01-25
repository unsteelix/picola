export interface IResizeOptions {
	width?: number
	height?: number
	fit?: any
}

export interface IJpegEngine {
	quality?: number
}

export interface IPngEngine {
	quality?: number
}

export type IFormat = any

export type IEngineOptions = IJpegEngine | IPngEngine

export type IOtherOptions = { [key: string]: any }

export interface IOptions {
	format: IFormat
	resizeOptions: IResizeOptions
	engineOptions: IEngineOptions
	otherOptions: IOtherOptions
}
