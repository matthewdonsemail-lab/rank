# Interface: UserIdentity

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).UserIdentity

Information about an authenticated user, derived from a [JWT](https://datatracker.ietf.org/doc/html/rfc7519).

The only fields guaranteed to be present are [tokenIdentifier](/api/interfaces/server.UserIdentity.md#tokenidentifier) and [issuer](/api/interfaces/server.UserIdentity.md#issuer). All remaining fields may or may not be present depending on the information given by the identity provider.

The explicitly listed fields are derived from the OpenID Connect (OIDC) standard fields, see the [OIDC specification](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims) for more information on these fields.

Any additional fields are custom claims that may be present in the JWT, and their type depends on your identity provider configuration. If you know the type of the field, you can assert it in TypeScript like this (for example as a `string`):

```
const identity = await ctx.auth.getUserIdentity();

if (identity === null) {

  return null;

}

const customClaim = identity.custom_claim as string;
```

## Indexable[​](#indexable "Direct link to Indexable")

▪ \[key: `string`]: [`JSONValue`](/api/modules/values.md#jsonvalue) | `undefined`

## Properties[​](#properties "Direct link to Properties")

### tokenIdentifier[​](#tokenidentifier "Direct link to tokenIdentifier")

• `Readonly` **tokenIdentifier**: `string`

A stable and globally unique string for this identity (i.e. no other user, even from a different identity provider, will have the same string.)

JWT claims: `sub` + `iss`

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/authentication.ts:107](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L107)

***

### subject[​](#subject "Direct link to subject")

• `Readonly` **subject**: `string`

Identifier for the end-user from the identity provider, not necessarily unique across different providers.

JWT claim: `sub`

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/authentication.ts:115](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L115)

***

### issuer[​](#issuer "Direct link to issuer")

• `Readonly` **issuer**: `string`

The hostname of the identity provider used to authenticate this user.

JWT claim: `iss`

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/authentication.ts:122](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L122)

***

### name[​](#name "Direct link to name")

• `Optional` `Readonly` **name**: `string`

JWT claim: `name`

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/authentication.ts:127](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L127)

***

### givenName[​](#givenname "Direct link to givenName")

• `Optional` `Readonly` **givenName**: `string`

JWT claim: `given_name`

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/authentication.ts:132](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L132)

***

### familyName[​](#familyname "Direct link to familyName")

• `Optional` `Readonly` **familyName**: `string`

JWT claim: `family_name`

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[server/authentication.ts:137](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L137)

***

### nickname[​](#nickname "Direct link to nickname")

• `Optional` `Readonly` **nickname**: `string`

JWT claim: `nickname`

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[server/authentication.ts:142](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L142)

***

### preferredUsername[​](#preferredusername "Direct link to preferredUsername")

• `Optional` `Readonly` **preferredUsername**: `string`

JWT claim: `preferred_username`

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[server/authentication.ts:147](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L147)

***

### profileUrl[​](#profileurl "Direct link to profileUrl")

• `Optional` `Readonly` **profileUrl**: `string`

JWT claim: `profile`

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[server/authentication.ts:152](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L152)

***

### pictureUrl[​](#pictureurl "Direct link to pictureUrl")

• `Optional` `Readonly` **pictureUrl**: `string`

JWT claim: `picture`

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[server/authentication.ts:157](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L157)

***

### email[​](#email "Direct link to email")

• `Optional` `Readonly` **email**: `string`

JWT claim: `email`

#### Defined in[​](#defined-in-10 "Direct link to Defined in")

[server/authentication.ts:162](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L162)

***

### emailVerified[​](#emailverified "Direct link to emailVerified")

• `Optional` `Readonly` **emailVerified**: `boolean`

JWT claim: `email_verified`

#### Defined in[​](#defined-in-11 "Direct link to Defined in")

[server/authentication.ts:167](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L167)

***

### gender[​](#gender "Direct link to gender")

• `Optional` `Readonly` **gender**: `string`

JWT claim: `gender`

#### Defined in[​](#defined-in-12 "Direct link to Defined in")

[server/authentication.ts:172](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L172)

***

### birthday[​](#birthday "Direct link to birthday")

• `Optional` `Readonly` **birthday**: `string`

JWT claim: `birthdate`

#### Defined in[​](#defined-in-13 "Direct link to Defined in")

[server/authentication.ts:177](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L177)

***

### timezone[​](#timezone "Direct link to timezone")

• `Optional` `Readonly` **timezone**: `string`

JWT claim: `zoneinfo`

#### Defined in[​](#defined-in-14 "Direct link to Defined in")

[server/authentication.ts:182](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L182)

***

### language[​](#language "Direct link to language")

• `Optional` `Readonly` **language**: `string`

JWT claim: `locale`

#### Defined in[​](#defined-in-15 "Direct link to Defined in")

[server/authentication.ts:187](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L187)

***

### phoneNumber[​](#phonenumber "Direct link to phoneNumber")

• `Optional` `Readonly` **phoneNumber**: `string`

JWT claim: `phone_number`

#### Defined in[​](#defined-in-16 "Direct link to Defined in")

[server/authentication.ts:192](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L192)

***

### phoneNumberVerified[​](#phonenumberverified "Direct link to phoneNumberVerified")

• `Optional` `Readonly` **phoneNumberVerified**: `boolean`

JWT claim: `phone_number_verified`

#### Defined in[​](#defined-in-17 "Direct link to Defined in")

[server/authentication.ts:197](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L197)

***

### address[​](#address "Direct link to address")

• `Optional` `Readonly` **address**: `string`

JWT claim: `address`

#### Defined in[​](#defined-in-18 "Direct link to Defined in")

[server/authentication.ts:202](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L202)

***

### updatedAt[​](#updatedat "Direct link to updatedAt")

• `Optional` `Readonly` **updatedAt**: `string`

JWT claim: `updated_at`

#### Defined in[​](#defined-in-19 "Direct link to Defined in")

[server/authentication.ts:207](https://github.com/get-convex/convex-js/blob/main/src/server/authentication.ts#L207)
