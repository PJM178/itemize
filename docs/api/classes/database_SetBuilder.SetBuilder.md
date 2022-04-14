[@onzag/itemize](../README.md) / [Modules](../modules.md) / [database/SetBuilder](../modules/database_SetBuilder.md) / SetBuilder

# Class: SetBuilder

[database/SetBuilder](../modules/database_SetBuilder.md).SetBuilder

## Hierarchy

- [`QueryBuilder`](database_base.QueryBuilder.md)

  ↳ **`SetBuilder`**

## Table of contents

### Constructors

- [constructor](database_SetBuilder.SetBuilder.md#constructor)

### Properties

- [expressions](database_SetBuilder.SetBuilder.md#expressions)

### Methods

- [addBindingSource](database_SetBuilder.SetBuilder.md#addbindingsource)
- [addBindingSources](database_SetBuilder.SetBuilder.md#addbindingsources)
- [clear](database_SetBuilder.SetBuilder.md#clear)
- [clearBindingSources](database_SetBuilder.SetBuilder.md#clearbindingsources)
- [compile](database_SetBuilder.SetBuilder.md#compile)
- [getBindings](database_SetBuilder.SetBuilder.md#getbindings)
- [popBindingSource](database_SetBuilder.SetBuilder.md#popbindingsource)
- [set](database_SetBuilder.SetBuilder.md#set)
- [setColumn](database_SetBuilder.SetBuilder.md#setcolumn)
- [setColumnWithTable](database_SetBuilder.SetBuilder.md#setcolumnwithtable)
- [setMany](database_SetBuilder.SetBuilder.md#setmany)
- [shiftBindingSource](database_SetBuilder.SetBuilder.md#shiftbindingsource)
- [shiftBindingSources](database_SetBuilder.SetBuilder.md#shiftbindingsources)
- [toSQL](database_SetBuilder.SetBuilder.md#tosql)

## Constructors

### constructor

• **new SetBuilder**()

Builds a new set builder

#### Overrides

[QueryBuilder](database_base.QueryBuilder.md).[constructor](database_base.QueryBuilder.md#constructor)

#### Defined in

[database/SetBuilder.ts:21](https://github.com/onzag/itemize/blob/5c2808d3/database/SetBuilder.ts#L21)

## Properties

### expressions

• `Private` **expressions**: `string`[] = `[]`

What we are setting as expressions

#### Defined in

[database/SetBuilder.ts:16](https://github.com/onzag/itemize/blob/5c2808d3/database/SetBuilder.ts#L16)

## Methods

### addBindingSource

▸ **addBindingSource**(`value`): `void`

Adds a binding source to the binding source list in order

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | [`ExtendedBindingType`](../modules/database_base.md#extendedbindingtype) | the binding source to add |

#### Returns

`void`

#### Inherited from

[QueryBuilder](database_base.QueryBuilder.md).[addBindingSource](database_base.QueryBuilder.md#addbindingsource)

#### Defined in

[database/base.ts:69](https://github.com/onzag/itemize/blob/5c2808d3/database/base.ts#L69)

___

### addBindingSources

▸ **addBindingSources**(`values`): `void`

Adds many binding sources to the bindings sources list

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `values` | [`ExtendedBindingType`](../modules/database_base.md#extendedbindingtype)[] | the binding sources to add |

#### Returns

`void`

#### Inherited from

[QueryBuilder](database_base.QueryBuilder.md).[addBindingSources](database_base.QueryBuilder.md#addbindingsources)

#### Defined in

[database/base.ts:77](https://github.com/onzag/itemize/blob/5c2808d3/database/base.ts#L77)

___

### clear

▸ **clear**(): [`SetBuilder`](database_SetBuilder.SetBuilder.md)

Clears all the expressions in the set rule

#### Returns

[`SetBuilder`](database_SetBuilder.SetBuilder.md)

itself

#### Defined in

[database/SetBuilder.ts:97](https://github.com/onzag/itemize/blob/5c2808d3/database/SetBuilder.ts#L97)

___

### clearBindingSources

▸ **clearBindingSources**(): `void`

Removes all binding sources

#### Returns

`void`

#### Inherited from

[QueryBuilder](database_base.QueryBuilder.md).[clearBindingSources](database_base.QueryBuilder.md#clearbindingsources)

#### Defined in

[database/base.ts:105](https://github.com/onzag/itemize/blob/5c2808d3/database/base.ts#L105)

___

### compile

▸ **compile**(): `string`

Converts this from query to a pseudo SQL query that uses ?

#### Returns

`string`

a string that represents the compiled result

#### Overrides

[QueryBuilder](database_base.QueryBuilder.md).[compile](database_base.QueryBuilder.md#compile)

#### Defined in

[database/SetBuilder.ts:86](https://github.com/onzag/itemize/blob/5c2808d3/database/SetBuilder.ts#L86)

___

### getBindings

▸ **getBindings**(): [`BasicBindingType`](../modules/database_base.md#basicbindingtype)[]

Provides the bindings for the query in order that
should match the compilation

#### Returns

[`BasicBindingType`](../modules/database_base.md#basicbindingtype)[]

a list of basic bindings

#### Inherited from

[QueryBuilder](database_base.QueryBuilder.md).[getBindings](database_base.QueryBuilder.md#getbindings)

#### Defined in

[database/base.ts:168](https://github.com/onzag/itemize/blob/5c2808d3/database/base.ts#L168)

___

### popBindingSource

▸ **popBindingSource**(): [`ExtendedBindingType`](../modules/database_base.md#extendedbindingtype)

Removes the last added biding source and returns it

#### Returns

[`ExtendedBindingType`](../modules/database_base.md#extendedbindingtype)

#### Inherited from

[QueryBuilder](database_base.QueryBuilder.md).[popBindingSource](database_base.QueryBuilder.md#popbindingsource)

#### Defined in

[database/base.ts:112](https://github.com/onzag/itemize/blob/5c2808d3/database/base.ts#L112)

___

### set

▸ **set**(`expression`, `bindings?`): [`SetBuilder`](database_SetBuilder.SetBuilder.md)

sets based on an expression

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `expression` | `string` | the expression to use |
| `bindings?` | [`BasicBindingType`](../modules/database_base.md#basicbindingtype)[] | - |

#### Returns

[`SetBuilder`](database_SetBuilder.SetBuilder.md)

itself

#### Defined in

[database/SetBuilder.ts:76](https://github.com/onzag/itemize/blob/5c2808d3/database/SetBuilder.ts#L76)

___

### setColumn

▸ **setColumn**(`columnName`, `value`): [`SetBuilder`](database_SetBuilder.SetBuilder.md)

allows to set an specific column an specific value

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnName` | `string` | the column to set |
| `value` | [`ValueType`](../modules/database_base.md#valuetype) | the value to set |

#### Returns

[`SetBuilder`](database_SetBuilder.SetBuilder.md)

itself

#### Defined in

[database/SetBuilder.ts:44](https://github.com/onzag/itemize/blob/5c2808d3/database/SetBuilder.ts#L44)

___

### setColumnWithTable

▸ **setColumnWithTable**(`tableName`, `columnName`, `value`): [`SetBuilder`](database_SetBuilder.SetBuilder.md)

allows to set an specific column an specific value

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tableName` | `string` | the table in question |
| `columnName` | `string` | the column to set |
| `value` | [`ValueType`](../modules/database_base.md#valuetype) | the value to set |

#### Returns

[`SetBuilder`](database_SetBuilder.SetBuilder.md)

itself

#### Defined in

[database/SetBuilder.ts:55](https://github.com/onzag/itemize/blob/5c2808d3/database/SetBuilder.ts#L55)

___

### setMany

▸ **setMany**(`value`): [`SetBuilder`](database_SetBuilder.SetBuilder.md)

allows to set many at once as a column-value fashion

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | [`IManyValueType`](../interfaces/database_base.IManyValueType.md) | the values to set |

#### Returns

[`SetBuilder`](database_SetBuilder.SetBuilder.md)

itself

#### Defined in

[database/SetBuilder.ts:30](https://github.com/onzag/itemize/blob/5c2808d3/database/SetBuilder.ts#L30)

___

### shiftBindingSource

▸ **shiftBindingSource**(`value`): `void`

Adds a binding source at the start of the bindings source
list

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | [`ExtendedBindingType`](../modules/database_base.md#extendedbindingtype) | the binding source to add |

#### Returns

`void`

#### Inherited from

[QueryBuilder](database_base.QueryBuilder.md).[shiftBindingSource](database_base.QueryBuilder.md#shiftbindingsource)

#### Defined in

[database/base.ts:89](https://github.com/onzag/itemize/blob/5c2808d3/database/base.ts#L89)

___

### shiftBindingSources

▸ **shiftBindingSources**(`values`): `void`

Adds many binding sources at the start of the bindings source
list

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `values` | [`ExtendedBindingType`](../modules/database_base.md#extendedbindingtype)[] | the binding sources to add |

#### Returns

`void`

#### Inherited from

[QueryBuilder](database_base.QueryBuilder.md).[shiftBindingSources](database_base.QueryBuilder.md#shiftbindingsources)

#### Defined in

[database/base.ts:98](https://github.com/onzag/itemize/blob/5c2808d3/database/base.ts#L98)

___

### toSQL

▸ **toSQL**(): `IQueryBuilderSQLResult`

Returns the SQL result for usage in the query builder

#### Returns

`IQueryBuilderSQLResult`

a sql builder result with the bindings and the query itself

#### Inherited from

[QueryBuilder](database_base.QueryBuilder.md).[toSQL](database_base.QueryBuilder.md#tosql)

#### Defined in

[database/base.ts:129](https://github.com/onzag/itemize/blob/5c2808d3/database/base.ts#L129)