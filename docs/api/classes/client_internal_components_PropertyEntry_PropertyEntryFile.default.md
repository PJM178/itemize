[@onzag/itemize](../README.md) / [Modules](../modules.md) / [client/internal/components/PropertyEntry/PropertyEntryFile](../modules/client_internal_components_PropertyEntry_PropertyEntryFile.md) / default

# Class: default

[client/internal/components/PropertyEntry/PropertyEntryFile](../modules/client_internal_components_PropertyEntry_PropertyEntryFile.md).default

This is the property entry file class

## Hierarchy

- `Component`<[`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`PropertyDefinitionSupportedFileType`](../modules/base_Root_Module_ItemDefinition_PropertyDefinition_types_file.md#propertydefinitionsupportedfiletype), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\>, `IPropertyEntryFileState`\>

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#constructor)

### Properties

- [context](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#context)
- [ownedObjectURLPool](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#ownedobjecturlpool)
- [props](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#props)
- [refs](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#refs)
- [state](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#state)
- [contextType](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#contexttype)

### Methods

- [UNSAFE\_componentWillMount](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#unsafe_componentwillmount)
- [UNSAFE\_componentWillReceiveProps](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#unsafe_componentwillreceiveprops)
- [UNSAFE\_componentWillUpdate](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#unsafe_componentwillupdate)
- [checkFileAcceptsAndCommit](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#checkfileacceptsandcommit)
- [componentDidCatch](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#componentdidcatch)
- [componentDidMount](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#componentdidmount)
- [componentDidUpdate](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#componentdidupdate)
- [componentWillMount](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#componentwillmount)
- [componentWillReceiveProps](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#componentwillreceiveprops)
- [componentWillUnmount](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#componentwillunmount)
- [componentWillUpdate](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#componentwillupdate)
- [enableUserSetErrors](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#enableuserseterrors)
- [forceUpdate](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#forceupdate)
- [getCurrentValue](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#getcurrentvalue)
- [getSnapshotBeforeUpdate](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#getsnapshotbeforeupdate)
- [onRemoveFile](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#onremovefile)
- [onSetFile](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#onsetfile)
- [onUpdateExtraMetadata](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#onupdateextrametadata)
- [openFile](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#openfile)
- [render](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#render)
- [setState](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#setstate)
- [shouldComponentUpdate](client_internal_components_PropertyEntry_PropertyEntryFile.default.md#shouldcomponentupdate)

## Constructors

### constructor

• **new default**(`props`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\> |

#### Overrides

React.Component&lt;
  IPropertyEntryHandlerProps&lt;PropertyDefinitionSupportedFileType, IPropertyEntryFileRendererProps\&gt;,
  IPropertyEntryFileState
  \&gt;.constructor

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:163](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L163)

## Properties

### context

• **context**: `any`

If using the new style context, re-declare this in your class to be the
`React.ContextType` of your `static contextType`.
Should be used with type annotation or static contextType.

```ts
static contextType = MyContext
// For TS pre-3.7:
context!: React.ContextType<typeof MyContext>
// For TS 3.7 and above:
declare context: React.ContextType<typeof MyContext>
```

**`see`** https://reactjs.org/docs/context.html

#### Inherited from

React.Component.context

#### Defined in

node_modules/@types/react/index.d.ts:479

___

### ownedObjectURLPool

• `Private` **ownedObjectURLPool**: `Object`

Owned object urls that creates blob urls
for the given files, it is cleared on dismount; this means
that any urls used that are temporary blobs will only
be available as long as the entry is active, as such
views will update, using the given url, and other entries
will keep themselves in sync, however once the entry is done
the values aren't available anymore, even if the state
still specifies a blob url because it hasn't been changed

Submitting will still work just fine, because the src still
points to a file

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:161](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L161)

___

### props

• `Readonly` **props**: `Readonly`<[`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\>\> & `Readonly`<{ `children?`: `ReactNode`  }\>

#### Inherited from

React.Component.props

#### Defined in

node_modules/@types/react/index.d.ts:504

___

### refs

• **refs**: `Object`

**`deprecated`**
https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs

#### Index signature

▪ [key: `string`]: `ReactInstance`

#### Inherited from

React.Component.refs

#### Defined in

node_modules/@types/react/index.d.ts:510

___

### state

• **state**: `Readonly`<`IPropertyEntryFileState`\>

#### Inherited from

React.Component.state

#### Defined in

node_modules/@types/react/index.d.ts:505

___

### contextType

▪ `Static` `Optional` **contextType**: `Context`<`any`\>

If set, `this.context` will be set at runtime to the current value of the given Context.

Usage:

```ts
type MyContext = number
const Ctx = React.createContext<MyContext>(0)

class Foo extends React.Component {
  static contextType = Ctx
  context!: React.ContextType<typeof Ctx>
  render () {
    return <>My context's value: {this.context}</>;
  }
}
```

**`see`** https://reactjs.org/docs/context.html#classcontexttype

#### Inherited from

React.Component.contextType

#### Defined in

node_modules/@types/react/index.d.ts:461

## Methods

### UNSAFE\_componentWillMount

▸ `Optional` **UNSAFE_componentWillMount**(): `void`

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use componentDidMount or the constructor instead

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Returns

`void`

#### Inherited from

React.Component.UNSAFE\_componentWillMount

#### Defined in

node_modules/@types/react/index.d.ts:717

___

### UNSAFE\_componentWillReceiveProps

▸ `Optional` **UNSAFE_componentWillReceiveProps**(`nextProps`, `nextContext`): `void`

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use static getDerivedStateFromProps instead

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextProps` | `Readonly`<[`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\>\> |
| `nextContext` | `any` |

#### Returns

`void`

#### Inherited from

React.Component.UNSAFE\_componentWillReceiveProps

#### Defined in

node_modules/@types/react/index.d.ts:749

___

### UNSAFE\_componentWillUpdate

▸ `Optional` **UNSAFE_componentWillUpdate**(`nextProps`, `nextState`, `nextContext`): `void`

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use getSnapshotBeforeUpdate instead

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextProps` | `Readonly`<[`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\>\> |
| `nextState` | `Readonly`<`IPropertyEntryFileState`\> |
| `nextContext` | `any` |

#### Returns

`void`

#### Inherited from

React.Component.UNSAFE\_componentWillUpdate

#### Defined in

node_modules/@types/react/index.d.ts:777

___

### checkFileAcceptsAndCommit

▸ **checkFileAcceptsAndCommit**(`isExpectingImages`, `acceptOverride`, `value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `isExpectingImages` | `boolean` |
| `acceptOverride` | `string` |
| `value` | [`IGQLFile`](../interfaces/gql_querier.IGQLFile.md) |

#### Returns

`void`

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:278](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L278)

___

### componentDidCatch

▸ `Optional` **componentDidCatch**(`error`, `errorInfo`): `void`

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |
| `errorInfo` | `ErrorInfo` |

#### Returns

`void`

#### Inherited from

React.Component.componentDidCatch

#### Defined in

node_modules/@types/react/index.d.ts:646

___

### componentDidMount

▸ `Optional` **componentDidMount**(): `void`

Called immediately after a component is mounted. Setting state here will trigger re-rendering.

#### Returns

`void`

#### Inherited from

React.Component.componentDidMount

#### Defined in

node_modules/@types/react/index.d.ts:625

___

### componentDidUpdate

▸ `Optional` **componentDidUpdate**(`prevProps`, `prevState`, `snapshot?`): `void`

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters

| Name | Type |
| :------ | :------ |
| `prevProps` | `Readonly`<[`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\>\> |
| `prevState` | `Readonly`<`IPropertyEntryFileState`\> |
| `snapshot?` | `any` |

#### Returns

`void`

#### Inherited from

React.Component.componentDidUpdate

#### Defined in

node_modules/@types/react/index.d.ts:688

___

### componentWillMount

▸ `Optional` **componentWillMount**(): `void`

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use componentDidMount or the constructor instead; will stop working in React 17

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Returns

`void`

#### Inherited from

React.Component.componentWillMount

#### Defined in

node_modules/@types/react/index.d.ts:703

___

### componentWillReceiveProps

▸ `Optional` **componentWillReceiveProps**(`nextProps`, `nextContext`): `void`

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use static getDerivedStateFromProps instead; will stop working in React 17

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextProps` | `Readonly`<[`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\>\> |
| `nextContext` | `any` |

#### Returns

`void`

#### Inherited from

React.Component.componentWillReceiveProps

#### Defined in

node_modules/@types/react/index.d.ts:732

___

### componentWillUnmount

▸ **componentWillUnmount**(): `void`

#### Returns

`void`

#### Overrides

React.Component.componentWillUnmount

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:206](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L206)

___

### componentWillUpdate

▸ `Optional` **componentWillUpdate**(`nextProps`, `nextState`, `nextContext`): `void`

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextProps` | `Readonly`<[`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\>\> |
| `nextState` | `Readonly`<`IPropertyEntryFileState`\> |
| `nextContext` | `any` |

#### Returns

`void`

#### Inherited from

React.Component.componentWillUpdate

#### Defined in

node_modules/@types/react/index.d.ts:762

___

### enableUserSetErrors

▸ **enableUserSetErrors**(): `void`

#### Returns

`void`

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:390](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L390)

___

### forceUpdate

▸ **forceUpdate**(`callback?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback?` | () => `void` |

#### Returns

`void`

#### Inherited from

React.Component.forceUpdate

#### Defined in

node_modules/@types/react/index.d.ts:496

___

### getCurrentValue

▸ `Private` **getCurrentValue**(): [`IGQLFile`](../interfaces/gql_querier.IGQLFile.md)

Provides the current value, either the actual value
or the rejected value

#### Returns

[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md)

a PropertyDefinitionSupportedFileType

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:218](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L218)

___

### getSnapshotBeforeUpdate

▸ `Optional` **getSnapshotBeforeUpdate**(`prevProps`, `prevState`): `any`

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters

| Name | Type |
| :------ | :------ |
| `prevProps` | `Readonly`<[`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\>\> |
| `prevState` | `Readonly`<`IPropertyEntryFileState`\> |

#### Returns

`any`

#### Inherited from

React.Component.getSnapshotBeforeUpdate

#### Defined in

node_modules/@types/react/index.d.ts:682

___

### onRemoveFile

▸ **onRemoveFile**(): `void`

#### Returns

`void`

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:384](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L384)

___

### onSetFile

▸ **onSetFile**(`file`, `info?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `file` | `File` |
| `info` | `IOnSetDataInfo` |

#### Returns

`void`

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:314](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L314)

___

### onUpdateExtraMetadata

▸ **onUpdateExtraMetadata**(`extraMetadata`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `extraMetadata` | `string` |

#### Returns

`void`

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:256](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L256)

___

### openFile

▸ **openFile**(): `void`

#### Returns

`void`

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:251](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L251)

___

### render

▸ **render**(): `Element`

#### Returns

`Element`

#### Overrides

React.Component.render

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:395](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L395)

___

### setState

▸ **setState**<`K`\>(`state`, `callback?`): `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof `IPropertyEntryFileState` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `IPropertyEntryFileState` \| (`prevState`: `Readonly`<`IPropertyEntryFileState`\>, `props`: `Readonly`<[`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\>\>) => `IPropertyEntryFileState` \| `Pick`<`IPropertyEntryFileState`, `K`\> \| `Pick`<`IPropertyEntryFileState`, `K`\> |
| `callback?` | () => `void` |

#### Returns

`void`

#### Inherited from

React.Component.setState

#### Defined in

node_modules/@types/react/index.d.ts:491

___

### shouldComponentUpdate

▸ **shouldComponentUpdate**(`nextProps`, `nextState`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextProps` | [`IPropertyEntryHandlerProps`](../interfaces/client_internal_components_PropertyEntry.IPropertyEntryHandlerProps.md)<[`IGQLFile`](../interfaces/gql_querier.IGQLFile.md), [`IPropertyEntryFileRendererProps`](../interfaces/client_internal_components_PropertyEntry_PropertyEntryFile.IPropertyEntryFileRendererProps.md)\> |
| `nextState` | `IPropertyEntryFileState` |

#### Returns

`boolean`

#### Overrides

React.Component.shouldComponentUpdate

#### Defined in

[client/internal/components/PropertyEntry/PropertyEntryFile.tsx:182](https://github.com/onzag/itemize/blob/5c2808d3/client/internal/components/PropertyEntry/PropertyEntryFile.tsx#L182)