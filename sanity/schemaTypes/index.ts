import { type SchemaTypeDefinition } from 'sanity'

import { categoryType } from './categoryType'

import { blockContentType } from './blockContentType'
import { productType } from './productType'
import { orderType } from './orderType'
import { salesType } from './salesType'
import user from './user'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, categoryType,productType,orderType,salesType,user],
}