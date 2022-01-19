
# Picola

A selfhosted image hosting, compressor and loader. Uses Sharp for any operations


## Features

- Self hosted
- Easy
- Fast
- All sharp features for image compressions


## Screenshots

![App Screenshot](https://i.ibb.co/3vpPH9s/image.png)

## Running

Run in docker container

```bash
  docker-compose up
```

Run without docker

```bash
  yarn start
```

## Development

Dev server with hot reload

```bash
  yarn dev
```

Build service

```bash
  yarn build
```

Start service

```bash
  yarn start
```
## API

#### Get original image

```http
  GET /i/:id
  GET /img/:id
  GET /image/:id
  GET /v1/i/:id
  GET /v1/img/:id
  GET /v1/image/:id  
```


| Parameter | Type     | Description                   |
| :-------- | :------- | :---------------------------- |
| `id` | `string` | **Required**. Id of original image |

#### Get optimized image

```http
  GET /i/:id?format=webp&width=1920&quality=85
```
| Parameter | Type     | Description                        |
| :-------- | :------- | :--------------------------------- |
| `id`      | `string` | **Required**. Id of original image |

| Query key             | Type            | Available                               | Description                       |
| :-------------------- | :-------------- | :-------------------------------------- | :-------------------------------- |
| `format \| f`         | `string`        | `jpeg, png, gif, webp`                  | Convert to format                 |
| `width  \| w`         | `number`        | `1-6000`                                | Resize width                      |
| `height \| h`         | `number`        | `1-6000`                                | Resize height                     |
| `fit \| f`            | `string`        | `cover, contain, fill, inside, outside` | Rule like css fit                 |
| `quality \| q`        | `number`        | `1-100`                                 | compression quality               |
| `modulate.brightness` | `number`        |                                         | Brightness multiplier             |
| `modulate.saturation` | `number`        |                                         | Saturation multiplier             |
| `modulate.hue`        | `number`        |                                         | Degrees for hue rotation          |
| `modulate.lightness`  | `number`        |                                         | Lightness addend                  |
| `sharpen`             | `array<number>` |                                         | **Sigma** of the Gaussian mask, where sigma = 1 + radius / 2. **Flat?** the level of sharpening to apply to "flat" areas. (optional, default 1.0) **Jagged?** level of sharpening to apply to "jagged" areas. (optional, default 2.0)|
| `blur`                | `number`        | `0.3-1000`                              | A value between 0.3 and 1000 representing the sigma of the Gaussian mask, where sigma = 1 + radius / 2. |


#### Upload image

```http
  POST /upload
```

#### Pages

```http
  GET /
  GET /docs
```
## Tech Stack

* TypeScript 
* Node
* Koa
* Sharp


## Authors

- [@unsteelix](https://www.github.com/unsteelix)


## Documentation

[Sharp](https://sharp.pixelplumbing.com)

