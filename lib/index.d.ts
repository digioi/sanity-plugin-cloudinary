import {AssetSource} from 'sanity'
import {ObjectDefinition} from 'sanity'
import {Plugin as Plugin_2} from 'sanity'
import {PreviewConfig} from 'sanity'

export declare type AssetDocument = {
  _id: string
  label?: string
  title?: string
  description?: string
  source?: {
    id: string
    name: string
    url?: string
  }
  creditLine?: string
  originalFilename?: string
}

export declare type CloudinaryAsset = {
  _type: string
  _key?: string
  _version: number
  public_id: string
  resource_type: string
  type: string
  format: string
  version: number
  url: string
  secure_url: string
  derived?: CloudinaryAssetDerived[]
}

export declare interface CloudinaryAssetContext {
  custom: object
}

export declare const cloudinaryAssetContext: {
  type: 'object'
  name: 'cloudinary.assetContext'
} & Omit<ObjectDefinition, 'preview'> & {
    preview?: PreviewConfig<Record<string, string>, Record<never, any>> | undefined
  }

export declare type CloudinaryAssetContextCustom = {
  alt: string
  caption: string
}

export declare const cloudinaryAssetContextCustom: {
  type: 'object'
  name: 'cloudinary.assetContextCustom'
} & Omit<ObjectDefinition, 'preview'> & {
    preview?: PreviewConfig<Record<string, string>, Record<never, any>> | undefined
  }

export declare type CloudinaryAssetDerived = {
  raw_transformation: string
  url: string
  secure_url: string
}

export declare const cloudinaryAssetDerivedSchema: {
  type: 'object'
  name: 'cloudinary.assetDerived'
} & Omit<ObjectDefinition, 'preview'> & {
    preview?: PreviewConfig<Record<string, string>, Record<never, any>> | undefined
  }

export declare const cloudinaryAssetSchema: {
  type: 'object'
  name: 'cloudinary.asset'
} & Omit<ObjectDefinition, 'preview'> & {
    preview?:
      | PreviewConfig<
          {
            url: string
            resource_type: string
            derived: string
          },
          Record<'url' | 'derived' | 'resource_type', any>
        >
      | undefined
  }

export declare const cloudinaryAssetSourcePlugin: Plugin_2<void>

export declare const cloudinaryImageSource: AssetSource

export declare const cloudinarySchemaPlugin: Plugin_2<void>

export {}
